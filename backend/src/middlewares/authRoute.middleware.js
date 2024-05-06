

export const routeCheck = async(req, res, next) => {

    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.("Bearer", "")
    
        
        if(!token && req.originalUrl !== '/login'){
            return res.redirect('/login');
        }

        if(req.originalUrl === '/login'){
            if(token){
                return res.redirect('/explore');
            }
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
}