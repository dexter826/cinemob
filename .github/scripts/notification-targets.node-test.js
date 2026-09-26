import assert from 'node:assert/strict';
import test from 'node:test';
import { getPushSubscriptionForUser, removeExpiredSubscription } from './notification-targets.js';

test('reads only the push subscription document owned by the requested user', async () => {
  const calls = [];
  const db = {
    collection(name) {
      calls.push(['collection', name]);
      return {
        doc(id) {
          calls.push(['doc', id]);
          return {
            async get() {
              return {
                exists: true,
                id,
                data: () => ({ endpoint: 'https://push.example', keys: { auth: 'a', p256dh: 'p' } }),
              };
            },
          };
        },
      };
    },
  };

  await assert.doesNotReject(async () => {
    const result = await getPushSubscriptionForUser(db, 'user-a');
    assert.deepEqual(result, [{
      id: 'user-a',
      endpoint: 'https://push.example',
      keys: { auth: 'a', p256dh: 'p' },
    }]);
  });
  assert.deepEqual(calls, [['collection', 'push_subscriptions'], ['doc', 'user-a']]);
});

test('returns no target for a missing or malformed subscription', async () => {
  const snapshots = [
    { exists: false },
    { exists: true, id: 'user-a', data: () => ({ endpoint: '', keys: null }) },
  ];
  const db = {
    collection: () => ({
      doc: () => ({ get: async () => snapshots.shift() }),
    }),
  };

  assert.deepEqual(await getPushSubscriptionForUser(db, 'user-a'), []);
  assert.deepEqual(await getPushSubscriptionForUser(db, 'user-a'), []);
});

test('deletes only expired subscription documents', async () => {
  const deleted = [];
  const db = {
    collection: () => ({
      doc: (id) => ({ delete: async () => deleted.push(id) }),
    }),
  };

  assert.equal(await removeExpiredSubscription(db, 'user-a', 500), false);
  assert.equal(await removeExpiredSubscription(db, 'user-a', 410), true);
  assert.deepEqual(deleted, ['user-a']);
});
