
exports.getWallet = async (req, res, next) => {
  try {
    const userSocial = await Service.User.GetInvestUserId(req.user._id);
    const wallet = await Service.Wallet.getWalletAmount(userSocial.accessToken)
    res.locals.wallet = {
      amount: wallet.Data.Wallet
    }
    
    return next();
  } catch (e) {
    return next(e);
  }
};