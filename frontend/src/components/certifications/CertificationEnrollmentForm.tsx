import React, { useState } from 'react';
import { Button, LoadingSpinner } from '../../components/common';
import CertificationsService from '../../services/certifications/certificationsService';
import toast from 'react-hot-toast';

interface CertificationEnrollmentFormProps {
  programId: number;
}

const CertificationEnrollmentForm: React.FC<CertificationEnrollmentFormProps> = ({ programId }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CertificationsService.enrollProgram(programId);
      toast.success('Inscrição realizada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao inscrever-se.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border border-orange-200 space-y-5 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Inscrever-se neste Programa</h3>
      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <><LoadingSpinner size="sm" className="mr-2" /> Processando...</> : 'Confirmar Inscrição'}
      </Button>
    </form>
  );
};

export default CertificationEnrollmentForm;
