import "./Button.css";

export default function Button ({ text, type = "button", className = "", ...props}) {
    return (
        <button
            type={type}
            className={className}
            {...props}
        >
            {text}
        </button>
    )
};