// tests for NextAuth configuration : checks if Github and Google providers are included
import { authOptions } from '../app/api/auth/[...nextauth]/route';
describe('NextAuth configuration', () => {
  it('should include Github and Google providers', () => { 
    const providers = authOptions.providers;
    const providerIds = providers.map(p => p.id || p.name);
    expect(providerIds).toEqual(
      expect.arrayContaining(['github', 'google'])
    );
  });
}); 
