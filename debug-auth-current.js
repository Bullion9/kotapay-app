// Import using dynamic import since we're dealing with TypeScript modules
let authService, AppwriteService;

console.log('🔧 Debugging Current Authentication State...\n');

async function debugCurrentAuth() {
  try {
    // Load modules dynamically
    const authModule = await import('./src/services/auth.ts');
    const apiModule = await import('./src/config/api.ts');
    authService = authModule.authService;
    AppwriteService = apiModule.default;

    console.log('1. Testing authService.getCurrentUser():');
    const currentUser = await authService.getCurrentUser();
    console.log('   Result:', currentUser ? {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      balance: currentUser.balance
    } : 'null');

    console.log('\n2. Testing direct database lookup for demo user:');
    const demoUser = await AppwriteService.getUserByEmail('demo@kotapay.com');
    console.log('   Database result:', demoUser ? {
      id: demoUser.$id,
      email: demoUser.email,
      name: demoUser.name,
      balance: demoUser.balance
    } : 'not found');

    console.log('\n3. Testing authService.login() for demo user:');
    const loginResult = await authService.login('demo@kotapay.com', 'DemoUser123!');
    console.log('   Login result:', loginResult ? {
      id: loginResult.id,
      email: loginResult.email,
      name: loginResult.name,
      balance: loginResult.balance
    } : 'null');

    console.log('\n4. Testing authService.getCurrentUser() after login:');
    const afterLoginUser = await authService.getCurrentUser();
    console.log('   After login:', afterLoginUser ? {
      id: afterLoginUser.id,
      email: afterLoginUser.email,
      name: afterLoginUser.name,
      balance: afterLoginUser.balance
    } : 'null');

  } catch (error) {
    console.error('❌ Error during auth debugging:', error.message);
    console.error('   Stack:', error.stack);
  }
}

debugCurrentAuth().then(() => {
  console.log('\n🎉 Auth debugging completed!');
}).catch(error => {
  console.error('❌ Fatal error:', error);
});
