import { describe, expect, it } from "vitest";
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validateUniOviEmail,
} from "../../../src/utils/validation";

describe("validation utils", () => {
  it("validates first name boundaries", () => {
    expect(validateFirstName("")).toBe("forms.validation.required");
    expect(validateFirstName("A")).toBe("forms.validation.firstNameLength");
    expect(validateFirstName("A".repeat(31))).toBe(
      "forms.validation.firstNameLength",
    );
    expect(validateFirstName(" Pablo ")).toBeNull();
  });

  it("validates last name boundaries", () => {
    expect(validateLastName("")).toBe("forms.validation.required");
    expect(validateLastName("A")).toBe("forms.validation.lastNameLength");
    expect(validateLastName("A".repeat(51))).toBe(
      "forms.validation.lastNameLength",
    );
    expect(validateLastName(" Carrasco ")).toBeNull();
  });

  it("validates university email pattern", () => {
    expect(validateUniOviEmail("")).toBe("forms.validation.required");
    expect(validateUniOviEmail("pablo@gmail.com")).toBe(
      "forms.validation.unioviEmail",
    );
    expect(validateUniOviEmail("uo289642@uniovi.es")).toBeNull();
    expect(validateUniOviEmail("UO289642@UNIOVI.ES")).toBeNull();
  });

  it("validates password boundaries", () => {
    expect(validatePassword("")).toBe("forms.validation.required");
    expect(validatePassword("1234567")).toBe("forms.validation.passwordLength");
    expect(validatePassword("1".repeat(73))).toBe(
      "forms.validation.passwordLength",
    );
    expect(validatePassword("12345678")).toBeNull();
  });
});
