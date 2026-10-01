import { test, expect } from '@playwright/test';

const uniqueEmail = () => `student-${Date.now()}-${Math.random()}@example.com`;
const username = () => `student-${Date.now()}`;

test.describe('Registration', { tag: '@auth' }, () => {

    test('successfully register user with valid credentials', async ({ page }) => {

        await page.goto('/register');
        await page.getByLabel(/username/i).fill(username());
        await page.getByLabel(/email/i).fill(uniqueEmail());
        await page.getByTestId('auth-password').fill('ValidPassword123!');
        await page.getByTestId('register-confirm-password').fill('ValidPassword123!');
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();
        await expect(page.getByTestId('nav-profile')).toBeVisible();

    });

    test('registration is not successful if use existing email', async ({ page }) => {
        const email = uniqueEmail();
        //register new user
        await page.goto('/register');
        await page.getByLabel(/username/i).fill(username());
        await page.getByLabel(/email/i).fill(email);
        await page.getByTestId('auth-password').fill('ValidPassword123!');
        await page.getByTestId('register-confirm-password').fill('ValidPassword123!');
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();
        await page.getByTestId('nav-profile').click();
        await page.getByRole('link', { name: 'Edit profile' }).click();
        await page.getByTestId('logout-button').click();

        //register new user with existing email
        await page.getByTestId('nav-sign-up').click();
        await page.getByLabel(/username/i).fill(username());
        await page.getByLabel(/email/i).fill(email);
        await page.getByTestId('auth-password').fill('ValidPassword123!');
        await page.getByTestId('register-confirm-password').fill('ValidPassword123!');
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();
        await expect(page.getByText('body email або username')).toContainText('body email або username вже зайняті');

    });

    test('registration is not successful with empty mandatory fields', async ({ page }) => {

        await page.goto('/register');
        await page.getByText('I agree to the terms of use').click();
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();

        await expect(page.getByTestId('error-messages')).toContainText('username ім\'я має містити щонайменше 3 символи');
        await expect(page.getByTestId('error-messages')).toContainText('email некоректний email');
        await expect(page.getByTestId('error-messages')).toContainText('password пароль має містити щонайменше 6 символів');

    });

});

test.describe('Login', { tag: '@auth' }, () => {
    test('login with valid credentials', async ({ page }) => {
        //new user registration
        const email = uniqueEmail();
        const name = username();
        const password = 'ValidPassword123!';

        await page.goto('/register');
        await page.getByLabel(/username/i).fill(name);
        await page.getByLabel(/email/i).fill(email);
        await page.getByTestId('auth-password').fill(password);
        await page.getByTestId('register-confirm-password').fill(password);
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();
        await page.getByTestId('nav-profile').click();
        await page.getByRole('link', { name: 'Edit profile' }).click();
        await page.getByTestId('logout-button').click();

        await page.goto('/login');
        await page.getByTestId('auth-email').fill(email);
        await page.getByTestId('auth-password').fill(password);
        await page.getByTestId('auth-password').press('Enter');
        await page.getByTestId('nav-profile').click();
        await expect(page.getByTestId('nav-profile')).toBeVisible();
    });

    test('login with invalid password', async ({ page }) => {
        const email = uniqueEmail();
        const name = username();
        const password = 'ValidPassword123!';

        await page.goto('/register');
        await page.getByLabel(/username/i).fill(name);
        await page.getByLabel(/email/i).fill(email);
        await page.getByTestId('auth-password').fill(password);
        await page.getByTestId('register-confirm-password').fill(password);
        await page.getByTestId('register-terms').check();
        await page.getByRole('button', { name: /Create account/i }).click();
        await page.getByTestId('nav-profile').click();
        await page.getByRole('link', { name: 'Edit profile' }).click();
        await page.getByTestId('logout-button').click();

        await page.goto('/login');
        await page.getByTestId('auth-email').fill(email);
        await page.getByTestId('auth-password').fill('incorrectPassword');
        await page.getByTestId('auth-password').press('Enter');

        await expect(page.getByTestId('error-messages')).toContainText('email or password неправильні');
    });

    test('login with invalid user', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('auth-email').fill('somerandomeamil@email.com');
        await page.getByTestId('auth-password').fill('incorrectPassword');
        await page.getByTestId('auth-password').press('Enter');

        await expect(page.getByTestId('error-messages')).toContainText('email or password неправильні');
    });
});
