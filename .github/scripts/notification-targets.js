export const getPushSubscriptionForUser = async (db, userId) => {
    const snapshot = await db.collection('push_subscriptions').doc(userId).get();
    if (!snapshot.exists) return [];

    const data = snapshot.data();
    if (!data?.endpoint || !data?.keys) return [];

    return [{
        id: snapshot.id,
        endpoint: data.endpoint,
        keys: data.keys,
    }];
};

export const removeExpiredSubscription = async (db, subscriptionId, statusCode) => {
    if (statusCode !== 404 && statusCode !== 410) return false;
    await db.collection('push_subscriptions').doc(subscriptionId).delete();
    return true;
};
