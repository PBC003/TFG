export type QuestionMathFieldError = {
  field: string;
  message: string;
};

export type QuestionMathValidationResult = {
  isValid: boolean;
  errors: QuestionMathFieldError[];
};
