// tests/employee.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Employee Management E2E', () => {
  const testEmployee = {
    name: 'Test User',
    email: 'test.user@example.com',
    position: 'QA Engineer',
  };

  const updatedEmployee = {
    name: 'Updated User',
    email: 'updated.user@example.com',
    position: 'Senior QA Engineer',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/');
  });

  test('should add a new employee', async ({ page }) => {
    await page.getByTestId('add-employee-button').click();
    await page.getByTestId('input-name').fill(testEmployee.name);
    await page.getByTestId('input-email').fill(testEmployee.email);
    await page.getByTestId('input-position').fill(testEmployee.position);
    await page.getByTestId('submit-employee-button').click();

    await expect(page.locator(`text=${testEmployee.name}`)).toBeVisible();
    await expect(page.locator(`text=${testEmployee.email}`)).toBeVisible();
    await expect(page.locator(`text=${testEmployee.position}`)).toBeVisible();
  });

  test('should edit an existing employee', async ({ page }) => {
    const employeeCard = page.locator(`text=${testEmployee.name}`).first().locator('..');

    await employeeCard.getByTestId('edit-employee-button').click();
    await page.getByTestId('input-name').fill(updatedEmployee.name);
    await page.getByTestId('input-email').fill(updatedEmployee.email);
    await page.getByTestId('input-position').fill(updatedEmployee.position);
    await page.getByTestId('submit-employee-button').click();

    await expect(page.locator(`text=${updatedEmployee.name}`)).toBeVisible();
    await expect(page.locator(`text=${updatedEmployee.email}`)).toBeVisible();
    await expect(page.locator(`text=${updatedEmployee.position}`)).toBeVisible();
  });

  test('should delete an employee', async ({ page }) => {
    const employeeCard = page.locator(`text=${updatedEmployee.name}`).first().locator('..');

    await employeeCard.getByTestId('delete-employee-button').click();
    await page.getByTestId('confirm-delete-button').click();

    await expect(page.locator(`text=${updatedEmployee.name}`)).not.toBeVisible();
    await expect(page.locator(`text=${updatedEmployee.email}`)).not.toBeVisible();
  });

  test('should cancel delete', async ({ page }) => {
    const name = 'Safe User';
    const email = 'safe.user@example.com';
    const position = 'Support';

    // Add user first
    await page.getByTestId('add-employee-button').click();
    await page.getByTestId('input-name').fill(name);
    await page.getByTestId('input-email').fill(email);
    await page.getByTestId('input-position').fill(position);
    await page.getByTestId('submit-employee-button').click();
    await expect(page.locator(`text=${name}`)).toBeVisible();

    // Attempt delete but cancel
    const employeeCard = page.locator(`text=${name}`).first().locator('..');
    await employeeCard.getByTestId('delete-employee-button').click();
    await page.getByTestId('cancel-delete-button').click();

    // Still visible
    await expect(page.locator(`text=${name}`)).toBeVisible();
  });
});
