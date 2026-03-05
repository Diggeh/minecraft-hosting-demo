import "./Button.css";

export default function Button({ text, children, type = "button", className = "", ...props }) {
    return (
        <button
            type={type}
            className={className}
            {...props}
        >
            {text}
            {children}
        </button>
    )
};