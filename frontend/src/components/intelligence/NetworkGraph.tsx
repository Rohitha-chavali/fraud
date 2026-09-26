import React, { useState } from 'react';
import { NetworkNode, NetworkLink } from '../../types';
import { ShieldAlert, User, Smartphone, MapPin, Store, Receipt, Info, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export const NetworkGraph: React.FC<GraphProps> = ({ nodes, links }) => {
  const { openLumoraWithPrompt } = useApp();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(nodes[0] || null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Layout coordinates for clean deterministic visual clarity
  const coordinates: Record<string, { x: number; y: number }> = {
    // Cluster 1 (Compromised Critical Syndicate)
    'CUST-4819': { x: 120, y: 150 },
    'DEV-LINUX-9912': { x: 260, y: 100 },
    'LOC-MUM': { x: 260, y: 220 },
    'LOC-LON': { x: 420, y: 90 },
    'MERCH-APPL': { x: 560, y: 100 },
    'TXN-92831': { x: 720, y: 140 },

    // Cluster 2 (Normal Baseline)
    'CUST-2910': { x: 120, y: 360 },
    'DEV-SMSG-4120': { x: 280, y: 350 },
    'LOC-BLR': { x: 440, y: 350 },
    'MERCH-CROMA': { x: 580, y: 350 },
    'TXN-41820': { x: 720, y: 350 },

    // Cluster 3 (Crypto Remittance Anomaly)
    'CUST-8102': { x: 120, y: 520 },
    'DEV-OP-7731': { x: 270, y: 490 },
    'LOC-DXB': { x: 430, y: 500 },
    'MERCH-CRYPTO': { x: 580, y: 510 },
    'TXN-77192': { x: 720, y: 510 },
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'customer':
        return <User className="w-3.5 h-3.5" />;
      case 'device':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'location':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'merchant':
        return <Store className="w-3.5 h-3.5" />;
      case 'transaction':
        return <Receipt className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#0b101f] border border-slate-800 p-6 flex flex-col shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Fraud Network</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Interactive Relationship Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore relationships between suspicious entities, proxy devices, and clearing merchants.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>High Risk / Flagged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Standard Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-3 rounded-xl bg-[#080d1a] border border-slate-800/80 p-4 overflow-x-auto relative">
          <svg viewBox="0 0 840 600" className="w-full min-w-[700px] h-[480px]">
            <defs>
              <linearGradient id="gradSuspicious" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradSafe" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Links / Edges */}
            {links.map((link, idx) => {
              const src = coordinates[link.source] || { x: 100, y: 100 };
              const tgt = coordinates[link.target] || { x: 300, y: 300 };
              const isHovered = hoveredNode === link.source || hoveredNode === link.target;

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={link.isSuspicious ? 'url(#gradSuspicious)' : 'url(#gradSafe)'}
                    strokeWidth={isHovered ? 3 : link.isSuspicious ? 2 : 1.2}
                    strokeDasharray={link.isSuspicious ? '4,3' : 'none'}
                    className="transition-all duration-300"
                  />
                  {/* Subtle relation text in middle */}
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 4}
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {link.relation}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = coordinates[node.id] || { x: 400, y: 300 };
              const isSelected = selectedNode?.id === node.id;
              const isSuspicious = node.isSuspicious;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glow circle for suspicious nodes */}
                  {isSuspicious && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSelected ? '18' : '15'}
                    fill={isSuspicious ? '#1c1017' : '#0c1a1f'}
                    stroke={
                      isSelected
                        ? '#a855f7'
                        : isSuspicious
                        ? '#ef4444'
                        : '#10b981'
                    }
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Inner Icon representation */}
                  <foreignObject x="-7" y="-7" width="14" height="14" className="pointer-events-none">
                    <div
                      className={`flex items-center justify-center text-[10px] ${
                        isSuspicious ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                  </foreignObject>

                  {/* Node Label */}
                  <text
                    y="28"
                    textAnchor="middle"
                    fill={isSelected ? '#c084fc' : isSuspicious ? '#fca5a5' : '#cbd5e1'}
                    fontSize="10"
                    fontWeight={isSelected || isSuspicious ? 'bold' : 'normal'}
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Entity Inspector Panel */}
        <div className="rounded-xl bg-[#090e1a] border border-slate-800 p-4 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Entity Inspector
                </span>
                <h4 className="text-sm font-bold text-white mt-1 break-words">
                  {selectedNode.label}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-mono uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {selectedNode.type}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      selectedNode.isSuspicious
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Risk: {selectedNode.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Network Status:</span>
                  <span className={selectedNode.isSuspicious ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                    {selectedNode.isSuspicious ? 'Correlated Breach' : 'Clean Fingerprint'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Linked Nodes:</span>
                  <span className="text-slate-200 font-mono">
                    {links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id).length} edges
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedNode.isSuspicious
                  ? 'This entity is correlated with anomalous amount velocity and unfeasible geographic displacement.'
                  : 'Behavioral signature aligns with standard moving average baselines.'}
              </p>

              <button
                onClick={() =>
                  openLumoraWithPrompt(`Analyze connections and risk for entity ${selectedNode.label}`)
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Lumora About Entity</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-10">
              Click any node in the graph to inspect relationship telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
