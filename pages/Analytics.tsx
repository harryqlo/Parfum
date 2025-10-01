import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getBusinessInsights } from '../services/geminiService';

const Analytics: React.FC = () => {
    const { products, sales, purchases } = useData();
    const [query, setQuery] = useState('');
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const presetQueries = [
        "¿Cuál es mi producto más rentable?",
        "¿Qué productos tienen bajo stock (menos de 2 unidades)?",
        "Resume el rendimiento de ventas del mes actual.",
        "Basado en las ventas, ¿qué género de perfume es más popular?",
        "Sugiere un producto para reponer basado en las ventas recientes."
    ];

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
    };

    const handlePresetQueryClick = (presetQuery: string) => {
        setQuery(presetQuery);
        handleSubmit(presetQuery);
    };

    const handleSubmit = async (currentQuery: string) => {
        if (!currentQuery.trim()) return;
        setIsLoading(true);
        setInsight('');
        try {
            const result = await getBusinessInsights(currentQuery, products, sales, purchases);
            setInsight(result);
        } catch (error) {
            setInsight('Ocurrió un error al generar el análisis. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(query);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Análisis de Negocio con IA</h1>
                <p className="text-text-secondary mt-2">
                    Haz preguntas en lenguaje natural sobre tus datos de negocio y obtén análisis instantáneos.
                </p>
            </div>

            <div className="bg-primary p-6 rounded-xl shadow-md border border-border">
                <form onSubmit={handleFormSubmit}>
                    <textarea
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Ej: ¿Cuál fue mi producto más vendido este mes?"
                        className="w-full bg-secondary p-3 rounded-md border border-border focus:ring-2 focus:ring-accent focus:outline-none transition text-text-primary"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analizando...' : 'Obtener Análisis'}
                    </button>
                </form>
            </div>
            
            <div className="mt-6">
                <p className="text-sm text-text-secondary mb-2">O prueba con estas sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                    {presetQueries.map((q, i) => (
                        <button 
                            key={i}
                            onClick={() => handlePresetQueryClick(q)}
                            className="bg-primary hover:bg-secondary text-text-secondary text-sm py-1 px-3 rounded-full border border-border transition"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="mt-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                    <p className="mt-2 text-text-secondary">La IA está pensando...</p>
                </div>
            )}

            {insight && !isLoading && (
                <div className="mt-8 bg-primary p-6 rounded-xl shadow-md border border-border">
                    <h2 className="text-xl font-semibold mb-3 text-accent">Análisis de IA</h2>
                    <div className="prose max-w-none text-text-primary whitespace-pre-wrap">
                        {insight}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;