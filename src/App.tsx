import React from 'react'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">OncoGraph-X</h1>
          <p className="text-xl text-gray-300">
            Multi-Modal Neural Architecture for Tumor Mutation & Resistance Tracking
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">🧬 Features</h2>
            <ul className="text-gray-300 space-y-2">
              <li>✅ Multi-Modal AI Analysis</li>
              <li>✅ 94.6% F1-Score Performance</li>
              <li>✅ HIPAA/GDPR Compliant</li>
              <li>✅ 38ms Inference Latency</li>
              <li>✅ Federated Learning Support</li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Benchmarks</h2>
            <div className="text-gray-300">
              <p className="mb-2"><span className="font-semibold">AUC-ROC:</span> 0.962</p>
              <p className="mb-2"><span className="font-semibold">Drift MSE:</span> 0.068</p>
              <p><span className="font-semibold">Lead Time:</span> +4.6 months</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://github.com/sangameshsk3712/oncograph-x"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
