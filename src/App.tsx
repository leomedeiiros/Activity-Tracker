import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  FileDown,
  Plus,
  X,
  Hash,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from './supabaseClient'; // <- IMPORTANTE

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

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Estados do formulário
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [responsible, setResponsible] = useState('');

  // Estado de filtros
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    cardNumber: '',
    responsible: ''
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Estado para edição (se for null, não estamos editando)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Carrega as atividades do Supabase ao montar o componente
  useEffect(() => {
    fetchActivities();
  }, []);

  // Função para buscar todas as atividades do banco
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false }); // ajusta se quiser outra ordenação

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return;
      }
      if (data) {
        // Mapeia os dados para converter "cardnumber" (campo do banco em minúsculo)
        // para "cardNumber" conforme sua interface
        const formattedData = data.map((activity: any) => ({
          ...activity,
          cardNumber: activity.cardnumber
        }));
        setActivities(formattedData);
      }
    } catch (err) {
      console.error('Erro desconhecido ao buscar atividades:', err);
    }
  };

  const resetForm = () => {
    setDate('');
    setDuration('');
    setDescription('');
    setCardNumber('');
    setResponsible('');
    setEditingActivityId(null);
  };

  // Cria ou atualiza a atividade
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Monta o objeto para inserir/atualizar usando "cardnumber" em minúsculo
    const activityData = {
      date,
      duration: parseInt(duration, 10),
      description,
      cardnumber: cardNumber, // Alterado para minúsculo, conforme a coluna do DB
      responsible
    };

    try {
      if (editingActivityId) {
        // Atualiza a atividade
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivityId);

        if (error) {
          console.error('Erro ao atualizar atividade:', error);
          return;
        }
      } else {
        // Insere nova atividade
        const { error } = await supabase
          .from('activities')
          .insert(activityData);

        if (error) {
          console.error('Erro ao criar atividade:', error);
          return;
        }
      }
      // Atualiza a listagem e reseta o formulário
      await fetchActivities();
      resetForm();
    } catch (err) {
      console.error('Erro desconhecido ao salvar atividade:', err);
    }
  };

  // Deletar atividade
  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir essa atividade?')) {
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar atividade:', error);
          return;
        }
        // Atualiza a listagem
        await fetchActivities();
      } catch (err) {
        console.error('Erro desconhecido ao deletar atividade:', err);
      }
    }
  };

  // Editar atividade
  const handleEdit = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setDate(activity.date);
    setDuration(activity.duration.toString());
    setDescription(activity.description);
    setCardNumber(activity.cardNumber);
    setResponsible(activity.responsible);
  };

  // Aplica filtros às atividades no front-end
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

  // Lógica de paginação
  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);
  const displayedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Exportar para CSV
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

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      cardNumber: '',
      responsible: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Profissional */}
      <header className="bg-blue-700 text-white shadow-md px-4 py-3">
        <h1 className="text-xl font-bold">Activity Manager</h1>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Card do formulário */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingActivityId ? 'Edit Activity' : 'Add New Activity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Card/Jira */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card/Jira Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    placeholder="Enter card number"
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    placeholder="Enter responsible person"
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Duração */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                    placeholder="Enter duration"
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="What did you do?"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                {editingActivityId ? 'Update Activity' : 'Add Activity'}
              </button>
              {editingActivityId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela de atividades */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Activities</h2>
            <div className="flex flex-col sm:flex-row gap-4">
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
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
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
                {displayedActivities.map((activity) => (
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
                        onClick={() => handleEdit(activity)}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-blue-600 hover:text-blue-800"
                        title="Edit Activity"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-red-600 hover:text-red-800 ml-2"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {displayedActivities.length === 0 && (
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
                    onClick={() => handlePageChange(page)}
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
      </div>
    </div>
  );
}

export default App;
