import React from "react";
import { AuthSplitScreen } from "../components/auth/AuthSplitScreen";

export const SignInPage: React.FC = () => {
  return <AuthSplitScreen initialMode="signin" />;
};
