import { AppService } from '../../src/app.service';

describe('AppService', () => {
  it('returns the root payload', () => {
    const service = new AppService();

    expect(service.getRoot()).toEqual({
      message: 'API running',
    });
  });

  it('returns a health payload with an ISO timestamp', () => {
    const service = new AppService();
    const result = service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('backend');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
