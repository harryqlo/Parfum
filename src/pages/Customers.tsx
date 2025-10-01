import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { EditIcon, DeleteIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon } from '../components/Icons';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import PageHero from '../components/PageHero';

type SortableCustomerKeys = keyof Customer;

const Customers: React.FC = () => {
    const { customers, sales, addCustomer, updateCustomer, deleteCustomer } = useData();
    const { showConfirmation, showToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableCustomerKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

    const extendedCustomers = useMemo(() => {
        return customers.map(customer => {
            const customerSales = sales.filter(s => s.customerId === customer.id);
            const totalSpent = customerSales.reduce((sum, s) => sum + s.total, 0);
            return {
                ...customer,
                totalSpent,
                purchaseCount: customerSales.length
            };
        });
    }, [customers, sales]);

    const filteredCustomers = useMemo(() => {
        return extendedCustomers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [extendedCustomers, searchTerm]);

    const sortedCustomers = useMemo(() => {
        let sortableItems = [...filteredCustomers];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredCustomers, sortConfig]);

    const requestSort = (key: SortableCustomerKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableCustomerKeys) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
    };

    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });

    useEffect(() => {
        if (isModalOpen && editingCustomer) {
            setFormData({ name: editingCustomer.name, phone: editingCustomer.phone, email: editingCustomer.email, notes: editingCustomer.notes });
        } else {
            setFormData({ name: '', phone: '', email: '', notes: '' });
        }
    }, [isModalOpen, editingCustomer]);

    const handleOpenModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = editingCustomer
            ? updateCustomer({ ...editingCustomer, ...formData })
            : addCustomer(formData);

        if (result.success) {
            showToast(result.message, 'success');
            handleCloseModal();
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleDelete = (customerId: string) => {
        showConfirmation({
            title: 'Eliminar Cliente',
            message: '¿Estás seguro de que quieres eliminar este cliente? Sus ventas pasadas permanecerán pero no estarán asociadas a él.',
            onConfirm: () => {
                const result = deleteCustomer(customerId);
                showToast(result.message, 'success');
            },
            confirmText: 'Sí, eliminar'
        });
    };
    
    const SortableHeader: React.FC<{ sortKey: SortableCustomerKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
        <th className="p-4 font-semibold cursor-pointer text-left" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">{children} {getSortIcon(sortKey)}</div>
        </th>
    );

    return (
        <div className="space-y-6">
            <PageHero
                title="Clientes"
                actions={
                    <>
                        <div className="w-full min-w-[220px] sm:w-72">
                            <label htmlFor="customerSearch" className="sr-only">Buscar cliente</label>
                            <input
                                id="customerSearch"
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-border bg-white/80 px-3 py-2 shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-accent-hover"
                        >
                            Agregar Cliente
                        </button>
                    </>
                }
            />
            <div className="overflow-hidden rounded-xl border border-border bg-primary shadow-md">
                {sortedCustomers.length === 0 ? (
                    <div className="text-center py-20">
                        <UsersIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">No hay clientes registrados</h3>
                        <p className="mt-1 text-sm text-text-secondary">Haz clic en "Agregar Cliente" para empezar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary">
                                <tr>
                                    <SortableHeader sortKey="name">Nombre</SortableHeader>
                                    <SortableHeader sortKey="phone">Teléfono</SortableHeader>
                                    <SortableHeader sortKey="email">Email</SortableHeader>
                                    <th className="p-4 font-semibold text-left">Compras</th>
                                    <th className="p-4 font-semibold text-left">Total Gastado</th>
                                    <th className="p-4 font-semibold text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                                        <td className="p-4 font-medium">
                                            <Link to={`/customers/${customer.id}`} className="text-accent hover:underline">
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td className="p-4">{customer.phone}</td>
                                        <td className="p-4">{customer.email}</td>
                                        <td className="p-4">{customer.purchaseCount}</td>
                                        <td className="p-4 font-semibold">{formatCurrency(customer.totalSpent)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleOpenModal(customer)} className="text-accent hover:text-accent-hover p-1"><EditIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(customer.id)} className="text-danger hover:opacity-75 p-1"><DeleteIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? "Editar Cliente" : "Agregar Nuevo Cliente"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nombre Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Teléfono</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-text-secondary">Notas Adicionales</label>
                        <textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent"></textarea>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModal} className="bg-secondary hover:bg-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">{editingCustomer ? "Guardar Cambios" : "Guardar Cliente"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;