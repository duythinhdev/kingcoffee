//test
exports.createPaymentRequest = async (req, res, next) => {
    try {
        const userSocial = await Service.User.GetInvestUserId(req.user._id);
        res.locals.search = await Service.Payment.createInvestTransaction(req.body, userSocial.accessToken);
        return next();
    } catch (e) {
        return next(e);
    }
};