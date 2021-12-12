exports.getAdminActionLogsList = async (req, res, next) =>{
    try{
        const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
        const take = parseInt(req.query.take, 10) || 10;
        const query = Helper.App.populateDbQuery(req.query, {
            text: ['action', 'username']
        });
        if(req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)){
            const count = await DB.AdminLog.countDocuments(query);
            const sort = {createdAt: -1};
            const admin_logs = await DB.AdminLog.find(query)
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .exec();
            res.locals.admin_action_logs = {
                count,
                admin_action_logs: admin_logs
            };
        }else{
            res.locals.admin_action_logs = {
                message: "Phải là quản trị viên mới có thể thực hiện chức năng này"
            };
        }
        return next();
    }catch(e){
        return next(e);
    }
}