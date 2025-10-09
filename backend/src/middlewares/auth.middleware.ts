import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Running isAuthenticated to check session");
    
    const headers = fromNodeHeaders(req.headers as Record<string, string>);

    const session = await auth.api.getSession({ headers });
    console.log("user's Session",session);
    

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        error: "No session found",
      });
    }
    console.log("Session found");
    

    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};
