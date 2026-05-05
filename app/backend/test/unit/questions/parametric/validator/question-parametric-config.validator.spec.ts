import { ParametricQuestionTemplateId } from '../../../../../src/questions/types/question-type-config.type';
import { isValidParametricConfig } from '../../../../../src/questions/parametric/validators/question-parametric-config.validator';

describe('question-parametric-config.validator', () => {
  it('accepts valid parametric configs with or without tolerance', () => {
    expect(
      isValidParametricConfig({
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
      }),
    ).toBe(true);

    expect(
      isValidParametricConfig({
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0,
      }),
    ).toBe(true);
  });

  it('rejects non-objects, invalid template ids and invalid tolerances', () => {
    expect(isValidParametricConfig(null)).toBe(false);
    expect(isValidParametricConfig('nope')).toBe(false);
    expect(
      isValidParametricConfig({
        templateId: 'invalid',
        tolerance: 0.1,
      }),
    ).toBe(false);
    expect(
      isValidParametricConfig({
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: Number.NaN,
      }),
    ).toBe(false);
    expect(
      isValidParametricConfig({
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: -0.1,
      }),
    ).toBe(false);
  });
});
