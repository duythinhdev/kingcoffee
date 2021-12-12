const adminLog = require('../../adminlog');
exports.create = async (username, text, action, before, after) => {
    try {
        const user = await DB.User.find({username})
        if (!user) {
            throw new Error("Tên đăng nhập không tồn tại")
        }
        
        await DB.AdminLog.create({
            username,
            text,
            action,
            before,
            after
        })
    } catch (error) {
        throw error;
    }
}