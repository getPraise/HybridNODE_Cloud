import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
// useTheme removed: Relying entirely on native Tailwind dark: classes
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom"; 
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

const EmailVerify = () => {
  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); 
  const inputRefs = useRef([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); 

  // Safely extract email from the router state or fallback
  const displayEmail = location.state?.email || userData?.email || "your registered email";

  // Resend Timer Logic
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  //pointer movement in otp box 
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  //on removing last entered value in otp box
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  //copy paste mechanims (split string)
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6).split("");
    pasteData.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const lastIndex = Math.min(pasteData.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const onSubmitHandler = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const otp = inputRefs.current.map((i) => i.value).join("");
    if (otp.length < 6) return toast.warning("Please enter the 6-digit code");

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, { otp });

      if (data.success) {
        toast.success("Email verified successfully");
        await getUserData(); 
        navigate("/workspace");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      if (data.success) {
        toast.success("Verification code sent");
        setResendCooldown(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  // Security Check
  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) navigate("/workspace");
  }, [isLoggedIn, userData, navigate]);

  return (
    /* Native Tailwind Theme Classes */
    <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl text-center border transition-all bg-white border-slate-200 shadow-slate-200/50 dark:bg-slate-900/40 dark:backdrop-blur-3xl dark:border-white/5 dark:shadow-black/50">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-blue-500" size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-black mb-2 tracking-tight text-slate-950 dark:text-white">
          Verify Account
        </h1>
        
        {/* Cleaned up redundant copy */}
        <p className="text-slate-500 text-sm mb-10 px-4 leading-relaxed font-medium">
          Enter the 6-digit code sent to <br/>
          <span className="text-blue-500 font-bold">{displayEmail}</span>
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-8">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {Array(6).fill(0).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  required
                  disabled={isSubmitting}
                  ref={(el) => (inputRefs.current[i] = el)}
                  onInput={(e) => handleInput(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  /* Native dark mode classes for inputs */
                  className="w-12 h-14 border rounded-xl text-center text-xl font-bold outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-blue-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 dark:bg-slate-950 dark:border-white/10 dark:text-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                />
              ))}
          </div>

          <div className="space-y-4">
            <button
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Finalize Verification"}
            </button>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendCooldown > 0 || isSubmitting}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                  resendCooldown > 0 ? "text-slate-600" : "text-blue-500 hover:text-blue-400"
                }`}
              >
                <RefreshCw size={12} className={resendCooldown > 0 ? "" : "animate-spin-slow"} />
                {resendCooldown > 0 
                  ? `Resend available in ${resendCooldown}s` 
                  : "Request New Code"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                disabled={isSubmitting}
                className="text-[10px] text-slate-500 hover:text-slate-400 uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={12} /> Use different email
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;