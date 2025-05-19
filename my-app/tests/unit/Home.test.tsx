import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import Home from '../../src/app/page';
import { GET_EMPLOYEES } from '../../src/graphql/query';
import { ADD_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from '../../src/graphql/mutation';

// Modern JSX transform configuration
React.createElement = React.createElement;

// Test types
interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
}

// Mock data
const employeesMock: Employee[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    position: 'Developer',
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    position: 'Designer',
  },
];

// GraphQL mock type
interface GraphQLMock {
  request: {
    query: any;
    variables?: any;
  };
  result?: {
    data?: any;
    errors?: any;
  };
  error?: Error;
}

// Test utilities
const renderComponent = (mocks: GraphQLMock[]) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Home />
    </MockedProvider>
  );
};

// Mocks for GraphQL operations
const mocks: GraphQLMock[] = [
  {
    request: { query: GET_EMPLOYEES },
    result: { data: { users: employeesMock } },
  },
  {
    request: { query: GET_EMPLOYEES },
    result: { data: { users: [...employeesMock, {
      id: '3',
      name: 'Charlie',
      email: 'charlie@example.com',
      position: 'Tester',
    }] } },
  },
  {
    request: {
      query: ADD_EMPLOYEE,
      variables: { name: 'Charlie', email: 'charlie@example.com', position: 'Tester' },
    },
    result: {
      data: {
        addEmployee: {
          id: '3',
          name: 'Charlie',
          email: 'charlie@example.com',
          position: 'Tester',
        },
      },
    },
  },
  {
    request: { query: GET_EMPLOYEES },
    result: { data: { users: [{
      id: '1',
      name: 'Alice Updated',
      email: 'aliceup@example.com',
      position: 'Lead',
    }, ...employeesMock.slice(1)] } },
  },
  {
    request: {
      query: UPDATE_EMPLOYEE,
      variables: { id: '1', name: 'Alice Updated', email: 'aliceup@example.com', position: 'Lead' },
    },
    result: {
      data: {
        updateEmployee: {
          id: '1',
          name: 'Alice Updated',
          email: 'aliceup@example.com',
          position: 'Lead',
        },
      },
    },
  },
  {
    request: { query: GET_EMPLOYEES },
    result: { data: { users: [employeesMock[0]] } },
  },
  {
    request: {
      query: DELETE_EMPLOYEE,
      variables: { id: '2' },
    },
    result: {
      data: {
        deleteEmployee: { id: '2' },
      },
    },
  },
  {
    request: { query: GET_EMPLOYEES },
    result: { data: { users: [employeesMock[0]] } },
  },
];

describe('Home Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows loading state initially', async () => {
    const { container } = renderComponent([]);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows error state', async () => {
    const errorMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        error: new Error('Failed to fetch'),
      },
    ];
    const { container } = renderComponent(errorMocks);
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  test('renders employee cards', async () => {
    const { container } = renderComponent(mocks);
    await screen.findByText('Alice');
    
    for (const emp of employeesMock) {
      expect(screen.getByText(emp.name)).toBeInTheDocument();
      expect(screen.getByText(emp.email)).toBeInTheDocument();
      expect(screen.getByText(emp.position)).toBeInTheDocument();
    }
  });

  test('adds new employee successfully', async () => {
    const addMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: ADD_EMPLOYEE,
          variables: { name: 'Charlie', email: 'charlie@example.com', position: 'Tester' },
        },
        result: {
          data: {
            addEmployee: {
              id: '3',
              name: 'Charlie',
              email: 'charlie@example.com',
              position: 'Tester',
            },
          },
        },
      },
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: [...employeesMock, {
          id: '3',
          name: 'Charlie',
          email: 'charlie@example.com',
          position: 'Tester',
        }] } },
      },
    ];

    const { container } = renderComponent(addMocks);
    await screen.findByText('Alice');

    // Click add button
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Fill form
    await userEvent.type(screen.getByTestId('input-name'), 'Charlie');
    await userEvent.type(screen.getByTestId('input-email'), 'charlie@example.com');
    await userEvent.type(screen.getByTestId('input-position'), 'Tester');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Wait for form to close and new employee to appear
    await waitFor(() => {
      expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
      expect(screen.getByText('Tester')).toBeInTheDocument();
    });
  });

  test('edits employee successfully', async () => {
    const editMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: UPDATE_EMPLOYEE,
          variables: { id: '1', name: 'Alice Updated', email: 'aliceup@example.com', position: 'Lead' },
        },
        result: {
          data: {
            updateEmployee: {
              id: '1',
              name: 'Alice Updated',
              email: 'aliceup@example.com',
              position: 'Lead',
            },
          },
        },
      },
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: [{
          id: '1',
          name: 'Alice Updated',
          email: 'aliceup@example.com',
          position: 'Lead',
        }, ...employeesMock.slice(1)] } },
      },
    ];

    const { container } = renderComponent(editMocks);
    await screen.findByText('Alice');

    // Click edit button
    const editButtons = screen.getAllByTestId('edit-employee-button');
    await userEvent.click(editButtons[0]);

    // Wait for form to appear
    await screen.findByText('Edit Employee');

    // Update form
    await userEvent.clear(screen.getByTestId('input-name'));
    await userEvent.type(screen.getByTestId('input-name'), 'Alice Updated');

    await userEvent.clear(screen.getByTestId('input-email'));
    await userEvent.type(screen.getByTestId('input-email'), 'aliceup@example.com');

    await userEvent.clear(screen.getByTestId('input-position'));
    await userEvent.type(screen.getByTestId('input-position'), 'Lead');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update Employee' });
    await userEvent.click(submitButton);

    // Wait for form to close and updates to be reflected
    await waitFor(() => {
      expect(screen.queryByText('Edit Employee')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Updated')).toBeInTheDocument();
      expect(screen.getByText('aliceup@example.com')).toBeInTheDocument();
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });
  });

  test('deletes employee successfully', async () => {
    const deleteMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: DELETE_EMPLOYEE,
          variables: { id: '2' },
        },
        result: {
          data: {
            deleteEmployee: { id: '2' },
          },
        },
      },
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: [employeesMock[0]] } },
      },
    ];

    const { container } = renderComponent(deleteMocks);
    await screen.findByText('Bob');

    // Click delete button
    const deleteButtons = screen.getAllByTestId('delete-employee-button');
    await userEvent.click(deleteButtons[1]);

    // Wait for delete confirmation modal
    await screen.findByText('Confirm Delete');

    // Click confirm
    const confirmButton = screen.getByTestId('confirm-delete-button');
    await userEvent.click(confirmButton);

    // Wait for modal to close and employee to be removed
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });

  test('cancels delete operation', async () => {
    const { container } = renderComponent(mocks);
    await screen.findByText('Bob');

    // Click delete button
    const deleteButtons = screen.getAllByTestId('delete-employee-button');
    await userEvent.click(deleteButtons[1]);

    // Wait for delete confirmation modal
    await screen.findByText('Confirm Delete');

    // Click cancel
    const cancelButton = screen.getByTestId('cancel-delete-button');
    await userEvent.click(cancelButton);

    // Verify modal is closed and Bob is still there
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('handles delete mutation error', async () => {
    const errorDeleteMock = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: DELETE_EMPLOYEE,
          variables: { id: '1' },
        },
        error: new Error('Delete failed'),
      },
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
    ];

    // Spy on window.alert and console.error
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = renderComponent(errorDeleteMock);

    await screen.findByText('Alice');

    // Click delete button for Alice (1st employee)
    const deleteButtons = screen.getAllByTestId('delete-employee-button');
    await userEvent.click(deleteButtons[0]);

    // Wait for delete confirmation modal
    await screen.findByText('Confirm Delete');

    // Confirm delete
    await userEvent.click(screen.getByTestId('confirm-delete-button'));

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Delete error:', expect.any(Error));
      expect(alertMock).toHaveBeenCalledWith('Delete failed');
    });

    // Wait for modal to close and verify Alice is still in the list
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Restore mocks
    alertMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  test('handles add employee error', async () => {
    const errorAddMock = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: ADD_EMPLOYEE,
          variables: { name: 'Charlie', email: 'charlie@example.com', position: 'Tester' },
        },
        error: new Error('Add failed'),
      },
    ];

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = renderComponent(errorAddMock);
    await screen.findByText('Alice');

    // Click add button
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Fill form
    await userEvent.type(screen.getByTestId('input-name'), 'Charlie');
    await userEvent.type(screen.getByTestId('input-email'), 'charlie@example.com');
    await userEvent.type(screen.getByTestId('input-position'), 'Tester');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Mutation error', expect.any(Error));
    });

    // Form should still be visible and data should be preserved
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toHaveValue('Charlie');
    expect(screen.getByTestId('input-email')).toHaveValue('charlie@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Tester');

    // Restore mock
    consoleErrorMock.mockRestore();
  });

  test('handles update employee error', async () => {
    const errorUpdateMock = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: UPDATE_EMPLOYEE,
          variables: { id: '1', name: 'Alice Updated', email: 'aliceup@example.com', position: 'Lead' },
        },
        error: new Error('Update failed'),
      },
    ];

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = renderComponent(errorUpdateMock);
    await screen.findByText('Alice');

    // Click edit button
    const editButtons = screen.getAllByTestId('edit-employee-button');
    await userEvent.click(editButtons[0]);

    // Wait for form to appear
    await screen.findByText('Edit Employee');

    // Update form
    await userEvent.clear(screen.getByTestId('input-name'));
    await userEvent.type(screen.getByTestId('input-name'), 'Alice Updated');

    await userEvent.clear(screen.getByTestId('input-email'));
    await userEvent.type(screen.getByTestId('input-email'), 'aliceup@example.com');

    await userEvent.clear(screen.getByTestId('input-position'));
    await userEvent.type(screen.getByTestId('input-position'), 'Lead');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update Employee' });
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Mutation error', expect.any(Error));
    });

    // Form should still be visible and data should be preserved
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toHaveValue('Alice Updated');
    expect(screen.getByTestId('input-email')).toHaveValue('aliceup@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Lead');

    // Restore mock
    consoleErrorMock.mockRestore();
  });

  test('handles form submission with empty data', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderComponent(mocks);
    await screen.findByText('Alice');

    // Click add button
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Submit form without filling data
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Form should still be visible due to HTML5 validation
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    consoleErrorMock.mockRestore();
  });

  test('handles edit button click and form submission', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const editMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: UPDATE_EMPLOYEE,
          variables: { id: '1', name: 'Alice Updated', email: 'aliceup@example.com', position: 'Lead' },
        },
        result: {
          data: {
            updateEmployee: {
              id: '1',
              name: 'Alice Updated',
              email: 'aliceup@example.com',
              position: 'Lead',
            },
          },
        },
      },
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: [{
          id: '1',
          name: 'Alice Updated',
          email: 'aliceup@example.com',
          position: 'Lead',
        }, ...employeesMock.slice(1)] } },
      },
    ];

    const { container } = renderComponent(editMocks);
    await screen.findByText('Alice');

    // Click edit button
    const editButtons = screen.getAllByTestId('edit-employee-button');
    await userEvent.click(editButtons[0]);

    // Wait for form to appear with employee data
    await screen.findByText('Edit Employee');
    expect(screen.getByTestId('input-name')).toHaveValue('Alice');
    expect(screen.getByTestId('input-email')).toHaveValue('alice@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Developer');

    // Update form
    await userEvent.clear(screen.getByTestId('input-name'));
    await userEvent.type(screen.getByTestId('input-name'), 'Alice Updated');

    await userEvent.clear(screen.getByTestId('input-email'));
    await userEvent.type(screen.getByTestId('input-email'), 'aliceup@example.com');

    await userEvent.clear(screen.getByTestId('input-position'));
    await userEvent.type(screen.getByTestId('input-position'), 'Lead');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update Employee' });
    await userEvent.click(submitButton);

    // Wait for form to close and updates to be reflected
    await waitFor(() => {
      expect(screen.queryByText('Edit Employee')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Updated')).toBeInTheDocument();
      expect(screen.getByText('aliceup@example.com')).toBeInTheDocument();
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });

    consoleErrorMock.mockRestore();
  });

  test('handles form submission with whitespace data', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderComponent(mocks);
    await screen.findByText('Alice');

    // Click add button
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Fill form with whitespace
    await userEvent.type(screen.getByTestId('input-name'), '   ');
    await userEvent.type(screen.getByTestId('input-email'), '   ');
    await userEvent.type(screen.getByTestId('input-position'), '   ');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Form should still be visible due to HTML5 validation
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    consoleErrorMock.mockRestore();
  });

  test('handles form submission error', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: ADD_EMPLOYEE,
          variables: { name: 'Charlie', email: 'charlie@example.com', position: 'Tester' },
        },
        error: new Error('Add failed'),
      },
    ];

    const { container } = renderComponent(errorMocks);
    await screen.findByText('Alice');

    // Click add button
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Fill form
    await userEvent.type(screen.getByTestId('input-name'), 'Charlie');
    await userEvent.type(screen.getByTestId('input-email'), 'charlie@example.com');
    await userEvent.type(screen.getByTestId('input-position'), 'Tester');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Mutation error', expect.any(Error));
    });

    // Form should still be visible and data should be preserved
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toHaveValue('Charlie');
    expect(screen.getByTestId('input-email')).toHaveValue('charlie@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Tester');

    consoleErrorMock.mockRestore();
  });

  test('handles update form submission error', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: UPDATE_EMPLOYEE,
          variables: { id: '1', name: 'Alice Updated', email: 'aliceup@example.com', position: 'Lead' },
        },
        error: new Error('Update failed'),
      },
    ];

    const { container } = renderComponent(errorMocks);
    await screen.findByText('Alice');

    // Click edit button
    const editButtons = screen.getAllByTestId('edit-employee-button');
    await userEvent.click(editButtons[0]);

    // Wait for form to appear
    await screen.findByText('Edit Employee');

    // Update form
    await userEvent.clear(screen.getByTestId('input-name'));
    await userEvent.type(screen.getByTestId('input-name'), 'Alice Updated');

    await userEvent.clear(screen.getByTestId('input-email'));
    await userEvent.type(screen.getByTestId('input-email'), 'aliceup@example.com');

    await userEvent.clear(screen.getByTestId('input-position'));
    await userEvent.type(screen.getByTestId('input-position'), 'Lead');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update Employee' });
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Mutation error', expect.any(Error));
    });

    // Form should still be visible and data should be preserved
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toHaveValue('Alice Updated');
    expect(screen.getByTestId('input-email')).toHaveValue('aliceup@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Lead');

    consoleErrorMock.mockRestore();
  });

  test('handles form toggle and close', async () => {
    const { container } = renderComponent(mocks);
    await screen.findByText('Alice');

    // Click add button to open form
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await screen.findByText('Add New Employee');

    // Click close button
    const closeButton = screen.getByRole('button', { name: '✖' });
    await userEvent.click(closeButton);

    // Form should be closed
    expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();

    // Click add button again
    await userEvent.click(addButton);

    // Form should appear again
    await screen.findByText('Add New Employee');

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    // Form should be closed
    expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
  });

  test('handles form submission error with refetch error', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMocks: GraphQLMock[] = [
      {
        request: { query: GET_EMPLOYEES },
        result: { data: { users: employeesMock } },
      },
      {
        request: {
          query: ADD_EMPLOYEE,
          variables: { name: 'Charlie', email: 'charlie@example.com', position: 'Tester' },
        },
        error: new Error('Add failed'),
      },
    ];

    const { container } = renderComponent(errorMocks);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Click add button and wait for form to appear
    const addButton = screen.getByTestId('add-employee-button');
    await userEvent.click(addButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByTestId('input-name');
    const emailInput = screen.getByTestId('input-email');
    const positionInput = screen.getByTestId('input-position');

    await userEvent.type(nameInput, 'Charlie');
    await userEvent.type(emailInput, 'charlie@example.com');
    await userEvent.type(positionInput, 'Tester');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Mutation error', expect.any(Error));
    });

    // Verify form is still visible and data is preserved
    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
      expect(nameInput).toHaveValue('Charlie');
      expect(emailInput).toHaveValue('charlie@example.com');
      expect(positionInput).toHaveValue('Tester');
    });

    consoleErrorMock.mockRestore();
  });

  test('handles edit button click with form data', async () => {
    const { container } = renderComponent(mocks);
    await screen.findByText('Alice');

    // Click edit button
    const editButtons = screen.getAllByTestId('edit-employee-button');
    await userEvent.click(editButtons[0]);

    // Wait for form to appear with employee data
    await screen.findByText('Edit Employee');
    
    // Verify form data is correctly populated
    expect(screen.getByTestId('input-name')).toHaveValue('Alice');
    expect(screen.getByTestId('input-email')).toHaveValue('alice@example.com');
    expect(screen.getByTestId('input-position')).toHaveValue('Developer');

    // Verify form is visible
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
  });
});
