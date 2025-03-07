import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  X,
  Hash,
  User,
  Edit,
  Trash2,
  FileDown
} from 'lucide-react';
import { supabase } from './supabaseClient';

interface Activity {
  id: string;
  date: string;
  duration: number;
  description: string;
  cardNumber: string;
  responsible: string;
}

interface Filters {
  startDate: string;
  endDate: string;
  cardNumber: string;
  responsible: string;
}

/* ------------------------------------------------------------------
   MODAL DE EDIÇÃO - Agora com layout melhorado
   ------------------------------------------------------------------ */
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onUpdate: (updated: Activity) => void;
  isSaving: boolean;
  error?: string;
}

function EditActivityModal({
  isOpen,
  onClose,
  activity,
  onUpdate,
  isSaving,
  error
}: EditModalProps) {
  const [editDate, setEditDate] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editResponsible, setEditResponsible] = useState('');

  // Ao abrir a modal, preencher os campos com os valores da atividade
  useEffect(() => {
    if (activity && isOpen) {
      setEditDate(activity.date);
      setEditDuration(activity.duration.toString());
      setEditDescription(activity.description);
      setEditCardNumber(activity.cardNumber);
      setEditResponsible(activity.responsible);
    }
  }, [activity, isOpen]);

  // Se a modal não estiver aberta ou não houver atividade, não renderiza
  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Monta objeto atualizado
    const updatedActivity: Activity = {
      id: activity.id,
      date: editDate,
      duration: parseInt(editDuration, 10),
      description: editDescription,
      cardNumber: editCardNumber,
      responsible: editResponsible
    };
    onUpdate(updatedActivity);
  };

  return (
    // Fundo semitransparente
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Conteúdo da modal */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 relative">
        {/* Botão de fechar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Activity</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid para organizar os campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Card/Jira Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card/Jira Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={editCardNumber}
                  onChange={(e) => setEditCardNumber(e.target.value)}
                  required
                  placeholder="Enter card number"
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Responsible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsible
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={editResponsible}
                  onChange={(e) => setEditResponsible(e.target.value)}
                  required
                  placeholder="Enter responsible person"
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  required
                  min="1"
                  placeholder="Enter duration"
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description (ocupa 2 colunas em telas médias) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
                placeholder="What did you do?"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Componente de Resumo Diário
   ------------------------------------------------------------------ */
interface SummaryProps {
  selectedDate: string;
  selectedResponsible: string;
  totalMinutes: number;
  onDateChange: (date: string) => void;
  onResponsibleChange: (resp: string) => void;
}
function Summary({
  selectedDate,
  selectedResponsible,
  totalMinutes,
  onDateChange,
  onResponsibleChange,
}: SummaryProps) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Summary</h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center">
          <Calendar className="mr-2 text-gray-400 h-5 w-5" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <User className="mr-2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={selectedResponsible}
            onChange={(e) => onResponsibleChange(e.target.value)}
            placeholder="Responsible"
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {(selectedDate || selectedResponsible) && (
          <p className="text-gray-700">
            Total Worked: {hours} {hours === 1 ? 'hour' : 'hours'} and {minutes}{' '}
            {minutes === 1 ? 'minute' : 'minutes'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Componente do Formulário de Adicionar Atividade (Somente criação)
   ------------------------------------------------------------------ */
interface ActivityFormProps {
  date: string;
  duration: string;
  description: string;
  cardNumber: string;
  responsible: string;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  error?: string;
}
function ActivityForm({
  date,
  duration,
  description,
  cardNumber,
  responsible,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  error,
}: ActivityFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Activity</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={date}
                onChange={(e) => onChange('date', e.target.value)}
                required
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Card/Jira Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card/Jira Number
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => onChange('cardNumber', e.target.value)}
                required
                placeholder="Enter card number"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Responsible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={responsible}
                onChange={(e) => onChange('responsible', e.target.value)}
                required
                placeholder="Enter responsible person"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                value={duration}
                onChange={(e) => onChange('duration', e.target.value)}
                required
                min="1"
                placeholder="Enter duration"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => onChange('description', e.target.value)}
              required
              placeholder="What did you do?"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSaving ? 'Saving...' : 'Add Activity'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------
   TABELA DE ATIVIDADES
   ------------------------------------------------------------------ */
interface ActivitiesTableProps {
  activities: Activity[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}
function ActivitiesTable({
  activities,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: ActivitiesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Activities</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card/Jira
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsible
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {activity.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {activity.cardNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {activity.responsible}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {activity.duration} minutes
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => onEdit(activity)}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-blue-600 hover:text-blue-800"
                    title="Edit Activity"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-red-600 hover:text-red-800 ml-2"
                    title="Delete Activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   COMPONENTE PRINCIPAL
   ------------------------------------------------------------------ */
function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    cardNumber: '',
    responsible: '',
  });

  // Form states (para criação de novas atividades)
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [responsible, setResponsible] = useState('');

  // Summary states
  const [selectedSummaryDate, setSelectedSummaryDate] = useState('');
  const [selectedSummaryResponsible, setSelectedSummaryResponsible] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  // Loading, saving and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // useEffect sem assinatura em tempo real
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        setErrorMessage('Erro ao buscar activities.');
        console.error('Erro ao buscar activities:', error);
        setIsLoading(false);
        return;
      }
      if (data) {
        const formattedData = data.map((activity: any) => ({
          ...activity,
          cardNumber: activity.cardnumber,
        }));
        setActivities(formattedData);
      }
    } catch (err) {
      setErrorMessage('Erro desconhecido ao buscar activities.');
      console.error('Erro desconhecido ao buscar activities:', err);
    }
    setIsLoading(false);
  };

  // Criar nova atividade (somente no form "Add New Activity")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!date) {
      setErrorMessage('Por favor, insira uma data.');
      return;
    }
    if (parseInt(duration, 10) <= 0) {
      setErrorMessage('A duração deve ser maior que zero.');
      return;
    }
    setIsSaving(true);
    const activityData = {
      date,
      duration: parseInt(duration, 10),
      description,
      cardnumber: cardNumber,
      responsible,
    };
    try {
      const { error } = await supabase.from('activities').insert(activityData);
      if (error) {
        setErrorMessage('Erro ao criar activity.');
        console.error('Erro ao criar activity:', error);
        setIsSaving(false);
        return;
      }
      await fetchActivities();
      resetForm();
    } catch (err) {
      setErrorMessage('Erro desconhecido ao salvar activity.');
      console.error('Erro desconhecido ao salvar activity:', err);
    }
    setIsSaving(false);
  };

  // Deletar atividade
  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir essa activity?')) {
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);
        if (error) {
          setErrorMessage('Erro ao deletar activity.');
          console.error('Erro ao deletar activity:', error);
          return;
        }
        await fetchActivities();
      } catch (err) {
        setErrorMessage('Erro desconhecido ao deletar activity.');
        console.error('Erro desconhecido ao deletar activity:', err);
      }
    }
  };

  // Abrir modal de edição
  const handleEdit = (activity: Activity) => {
    setActivityToEdit(activity);
    setShowEditModal(true);
  };

  // Fechar modal de edição
  const closeEditModal = () => {
    setShowEditModal(false);
    setActivityToEdit(null);
    setErrorMessage('');
  };

  // Atualizar atividade (ao salvar no modal)
  const handleUpdateActivity = async (updated: Activity) => {
    setErrorMessage('');
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          date: updated.date,
          duration: updated.duration,
          description: updated.description,
          cardnumber: updated.cardNumber,
          responsible: updated.responsible,
        })
        .eq('id', updated.id);
      if (error) {
        setErrorMessage('Erro ao atualizar activity.');
        console.error('Erro ao atualizar activity:', error);
        setIsSaving(false);
        return;
      }
      await fetchActivities();
      // Fechar modal
      closeEditModal();
    } catch (err) {
      setErrorMessage('Erro desconhecido ao salvar activity.');
      console.error('Erro desconhecido ao salvar activity:', err);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setDate('');
    setDuration('');
    setDescription('');
    setCardNumber('');
    setResponsible('');
    setErrorMessage('');
  };

  // Cálculo do total de minutos para o resumo
  const getTotalDurationForFilter = (selectedDate: string, selectedResp: string) => {
    return activities
      .filter((activity) => {
        const dateMatch = selectedDate ? activity.date === selectedDate : true;
        const responsibleMatch = selectedResp
          ? activity.responsible.toLowerCase().includes(selectedResp.toLowerCase())
          : true;
        return dateMatch && responsibleMatch;
      })
      .reduce((sum, activity) => sum + activity.duration, 0);
  };

  // Filtro para a tabela
  const filteredActivities = activities.filter((activity) => {
    const dateInRange =
      (!filters.startDate || activity.date >= filters.startDate) &&
      (!filters.endDate || activity.date <= filters.endDate);
    const cardMatch =
      !filters.cardNumber ||
      activity.cardNumber.toLowerCase().includes(filters.cardNumber.toLowerCase());
    const responsibleMatch =
      !filters.responsible ||
      activity.responsible.toLowerCase().includes(filters.responsible.toLowerCase());
    return dateInRange && cardMatch && responsibleMatch;
  });

  // Paginação
  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);
  const displayedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Card/Jira Number', 'Responsible', 'Duration (minutes)', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredActivities.map((activity) =>
        [
          activity.date,
          activity.cardNumber,
          activity.responsible,
          activity.duration,
          `"${activity.description}"`
        ].join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activities_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      cardNumber: '',
      responsible: '',
    });
  };

  const totalMinutes =
    selectedSummaryDate || selectedSummaryResponsible
      ? getTotalDurationForFilter(selectedSummaryDate, selectedSummaryResponsible)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md px-4 py-3">
        <h1 className="text-xl font-bold">Activity Manager</h1>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Global error */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        {/* Loading */}
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
            Loading activities...
          </div>
        )}

        {/* Summary */}
        <Summary
          selectedDate={selectedSummaryDate}
          selectedResponsible={selectedSummaryResponsible}
          totalMinutes={totalMinutes}
          onDateChange={setSelectedSummaryDate}
          onResponsibleChange={setSelectedSummaryResponsible}
        />

        {/* Form para Adicionar Nova Atividade */}
        <ActivityForm
          date={date}
          duration={duration}
          description={description}
          cardNumber={cardNumber}
          responsible={responsible}
          onChange={(field, value) => {
            if (field === 'date') setDate(value);
            else if (field === 'duration') setDuration(value);
            else if (field === 'description') setDescription(value);
            else if (field === 'cardNumber') setCardNumber(value);
            else if (field === 'responsible') setResponsible(value);
          }}
          onSubmit={handleSubmit}
          onCancel={() => {}}
          isSaving={isSaving}
          error={errorMessage}
        />

        {/* Seção de Filtros e Export CSV */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    placeholder="Start date"
                    className="pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    placeholder="End date"
                    className="pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <input
                type="text"
                value={filters.cardNumber}
                onChange={(e) =>
                  setFilters({ ...filters, cardNumber: e.target.value })
                }
                placeholder="Filter by card number"
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={filters.responsible}
                onChange={(e) =>
                  setFilters({ ...filters, responsible: e.target.value })
                }
                placeholder="Filter by responsible"
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {(filters.startDate ||
                filters.endDate ||
                filters.cardNumber ||
                filters.responsible) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
            {/* Botão de Export CSV */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FileDown className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabela de Atividades */}
        <ActivitiesTable
          activities={displayedActivities}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal para Edição (agora estilizada) */}
      <EditActivityModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        activity={activityToEdit}
        onUpdate={handleUpdateActivity}
        isSaving={isSaving}
        error={errorMessage}
      />
    </div>
  );
}

export default App;
