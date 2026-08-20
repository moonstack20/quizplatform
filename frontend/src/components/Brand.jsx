function Brand({ size = "md" }) {
    const sizes = {
      sm: "text-base",
      md: "text-xl",
      lg: "text-3xl",
    };
  
    return (
      <span className={`font-bold text-brand-600 ${sizes[size]}`}>
        📚 QuizSphere
      </span>
    );
  }
  
  export default Brand;
  