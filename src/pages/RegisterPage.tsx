import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { createCheckoutSessionWithCustomerData } from '../lib/stripe';
import { products, ProductId } from '../stripe-config';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedPlan = queryParams.get('plan') as ProductId | null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: selectedPlan || 'basic_monthly',
    employees: '',
    couponCode: '',
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedProduct = products[formData.plan as ProductId];
      if (!selectedProduct) {
        throw new Error('Invalid plan selected');
      }

      // Salvar dados do formulário no localStorage para uso na página de sucesso
      localStorage.setItem('registrationData', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        employees: formData.employees,
        plan: formData.plan,
        couponCode: formData.couponCode
      }));

      // Dados do cliente para o Stripe (SEM A SENHA por segurança)
      const customerData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        cnpj: formData.cnpj,
        razaoSocial: formData.companyName,
        employee_count: formData.employees,
        domain: '', // Será preenchido pelo backend baseado no email ou por campo separado
        couponCode: formData.couponCode
      };

      await createCheckoutSessionWithCustomerData(
        selectedProduct.priceId, 
        selectedProduct.mode,
        customerData,
        true
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 1 ? <CheckCircle size={20} /> : 1}
                </div>
                <span className="text-sm mt-2">Seus Dados</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
              
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 2 ? <CheckCircle size={20} /> : 2}
                </div>
                <span className="text-sm mt-2">Sua Empresa</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} />
              
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className="text-sm mt-2">Confirmação</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Crie sua conta no TicketWise</h1>
                <form onSubmit={handleNext}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      maxLength={128}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Entre 8 e 128 caracteres</p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirme a Senha</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    Próximo <ArrowRight size={16} className="ml-2" />
                  </button>

                  <p className="text-center text-gray-600 mt-6">
                    Já tem uma conta? <a href="https://app.ticketwise.com.br" className="text-purple-600 font-medium hover:text-purple-700">Faça login</a>
                  </p>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Sobre sua Empresa</h1>
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">Número de Funcionários</label>
                    <select
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="501+">501+</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Cupom de Desconto (Opcional)
                    </label>
                    <input
                      type="text"
                      id="couponCode"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleChange}
                      placeholder="Digite seu código de desconto"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Aplicaremos o desconto automaticamente se o cupom for válido</p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="basic_monthly">Básico Mensal - R$119/mês</option>
                      <option value="basic_annual">Básico Anual - R$1.212/ano</option>
                      <option value="pro_monthly">Profissional Mensal - R$199/mês</option>
                      <option value="pro_annual">Profissional Anual - R$2.028/ano</option>
                      <option value="enterprise_monthly">Enterprise Mensal - R$299/mês</option>
                      <option value="enterprise_annual">Enterprise Anual - R$3.048/ano</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                        Eu concordo com os <Link to="/terms" className="text-purple-600 hover:text-purple-700">Termos de Serviço</Link> e <Link to="/privacy" className="text-purple-600 hover:text-purple-700">Política de Privacidade</Link>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 bg-white text-gray-700 font-medium py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white font-medium py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Criar Conta
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;