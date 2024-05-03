

export const dashboardController = (req, res) => {
    const user = JSON.stringify(req.user);
    return res.render('dashboard', { layout: 'main', userObj : user , username : req.user.username});
}
