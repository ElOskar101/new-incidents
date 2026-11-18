import * as React from "react";
import { cn } from "../../utils/cn";

export const RoundedButton = ({children, className, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            className={cn("rounded-full bg-primary p-1 text-primary-content", className)}>
            {children}
        </button>
    )
}
