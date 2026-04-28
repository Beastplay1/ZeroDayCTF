import Link from "next/link";
import { Orbitron, Roboto_Mono } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
      <div className="relative">
        <h1 className={`text-9xl font-bold text-red-600 opacity-20 ${orbitron.className}`}>
          403
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className={`text-4xl font-bold text-white mb-2 ${orbitron.className}`}>
            ACCESS DENIED
          </h2>
          <div className="h-1 w-24 bg-red-600 animate-pulse mb-4"></div>
        </div>
      </div>

      <div className={`max-w-md mt-8 p-6 border-2 border-red-600/30 bg-red-600/5 rounded-sm ${robotoMono.className}`}>
        <p className="text-red-500 font-bold mb-4">
          [!] SECURITY ALERT: UNAUTHORIZED ACCESS ATTEMPT DETECTED
        </p>
        <p className="text-gray-400 text-sm mb-6">
          The resource you are trying to access is restricted, or your security token has expired/already been used. Your IP and activity have been logged.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors rounded-sm"
        >
          RETURN TO HOME
        </Link>
      </div>

      <div className="mt-12 text-gray-700 text-xs font-mono animate-pulse">
        <p>TERMINAL_ERROR_CODE: 0x00000193</p>
        <p>ENCRYPTION_STATUS: COMPROMISED</p>
      </div>
    </div>
  );
}
