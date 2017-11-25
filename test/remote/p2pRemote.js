class P2PRemote {
    constructor(app) {
        this.app = app;
    }
    sendMessageByUid(uid, msg, next) {
        console.log('sendMessageByUid');
        console.log(this.app);
        next();
    }
    sendGroupMessage(uids, msg, next) {
        console.log('sendGroupMessage');
        console.log(this.app);
        next();
    }
}
module.exports = app => new P2PRemote(app);
