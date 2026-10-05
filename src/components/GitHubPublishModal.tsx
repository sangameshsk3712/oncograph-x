import { useState } from 'react';
import { Github, Upload, Key, CheckCircle2, AlertCircle, ExternalLink, Download, Copy, Check, X, Sparkles } from 'lucide-react';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal = ({ isOpen, onClose }: GitHubPublishModalProps) => {
  const [token, setToken] = useState<string>('');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; repoUrl?: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  if (!isOpen) return null;

  const repoUrl = 'https://github.com/sangameshsk3712/oncograph-x';

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          repoOwner: 'sangameshsk3712',
          repoName: 'oncograph-x',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message,
          repoUrl: data.repoUrl,
        });
      } else {
        setPushResult({
          success: false,
          message: data.error || 'Failed to push. Verify token permissions (repo scope required).',
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || 'Network error while attempting GitHub push.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const manualCommands = `git remote add origin https://github.com/sangameshsk3712/oncograph-x.git
git branch -M main
git push -u origin main`;

  const copyCommands = () => {
    navigator.clipboard.writeText(manualCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white">
              <Github className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Publish OncoGraph-X to GitHub
              </h3>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>sangameshsk3712 / oncograph-x</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Form with Personal Access Token */}
        <form onSubmit={handlePush} className="space-y-4">
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-200 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                GitHub Personal Access Token (PAT):
              </span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=OncoGraph-X-Push"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
              >
                <span>Generate 1-Minute Token on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token (starts with ghp_... or github_pat_...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-400">
              GitHub requires a Personal Access Token with <code>repo</code> write permission to authenticate pushes over HTTPS.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPushing || !token.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-medium text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40"
          >
            {isPushing ? (
              <>
                <Upload className="w-3.5 h-3.5 animate-bounce" />
                <span>Pushing all 27 files to sangameshsk3712/oncograph-x...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Push Code Directly to sangameshsk3712 / oncograph-x</span>
              </>
            )}
          </button>
        </form>

        {/* Feedback Message */}
        {pushResult && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
              pushResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {pushResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{pushResult.success ? 'Successfully Published!' : 'Push Failed'}</span>
            </div>
            <p>{pushResult.message}</p>
            {pushResult.repoUrl && (
              <a
                href={pushResult.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-white underline mt-1"
              >
                <span>View Live Repository on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Alternative Option: Download Complete Git Bundle / Push via Terminal */}
        <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
          <span className="font-semibold text-slate-300 block">
            Alternative 1-Click Download &amp; Local Options:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/api/download-bundle"
              download="oncograph-x.bundle"
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-800 rounded-lg flex items-center justify-between transition-colors group"
            >
              <div className="space-y-0.5">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Download Git Bundle
                </span>
                <p className="text-[10px] text-slate-400">Contains all commits &amp; history (100 KB)</p>
              </div>
            </a>

            <button
              onClick={copyCommands}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-800 rounded-lg flex items-center justify-between transition-colors text-left group"
            >
              <div className="space-y-0.5">
                <span className="font-medium text-white flex items-center gap-1.5">
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  {copiedCmd ? 'Commands Copied!' : 'Copy Terminal Push Commands'}
                </span>
                <p className="text-[10px] text-slate-400">Run in your terminal to push via SSH/HTTPS</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
