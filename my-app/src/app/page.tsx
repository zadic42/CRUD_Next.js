'use client';
import React from 'react';
import { useState } from "react";
import { useQuery, useMutation } from '@apollo/client';
import { GET_EMPLOYEES } from '../graphql/query';
import { ADD_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from '../graphql/mutation';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
}

export default function Home() {
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES);
  const [addEmployee] = useMutation(ADD_EMPLOYEE);
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE);
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE);

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', position: '' });

  const resetForm = () => {
    setFormData({ name: '', email: '', position: '' });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      position: formData.position.trim()
    };

    try {
      if (editingEmployee) {
        await updateEmployee({ variables: { id: editingEmployee.id, ...trimmedData } });
      } else {
        await addEmployee({ variables: trimmedData });
      }
      await refetch();
      resetForm();
    } catch (err) {
      console.error("Mutation error", err);
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData(employee);
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEmployee({ variables: { id: deleteId } });
      await refetch();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete employee.');
    } finally {
      setDeleteId(null);
    }
  };

  const cancelDelete = () => setDeleteId(null);

  const toggleForm = () => {
    if (showForm) resetForm();
    else setShowForm(true);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  const employees: Employee[] = data?.users || [];

  return (
    <>
      {/* Add/Edit Button */}
      <div className="flex justify-end p-5">
        <button
          onClick={toggleForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          data-testid="add-employee-button"
        >
          + Add Employee
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={toggleForm} className="text-gray-500 hover:text-gray-700">
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {["name", "email", "position"].map((field) => (
                <div key={field} className="space-y-1">
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={field === "email" ? "email" : "text"}
                    value={(formData as any)[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={field.charAt(0).toUpperCase() + field.slice(1)}
                    data-testid={`input-${field}`}
                  />
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={toggleForm}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  data-testid="submit-employee-button"
                >
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-2xl shadow p-6 relative group transition-shadow hover:shadow-md">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(employee)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                data-testid="edit-employee-button"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(employee.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                data-testid="delete-employee-button"
              >
                🗑️
              </button>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{employee.position}</p>
            <p className="text-blue-600 text-sm mt-2">{employee.email}</p>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <p className="text-gray-600">Are you sure you want to delete this employee?</p>
              <p className="text-gray-600">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                data-testid="cancel-delete-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                data-testid="confirm-delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
