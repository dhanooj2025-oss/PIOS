import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePricingStore } from './store/usePricingStore';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { AuthScreen } from './utils/AuthScreen';
import {
  convertCurrency,
  calculateProductiveHours,
  calculateEffectiveHourlyCost
} from './utils/pricingEngine';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Server,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  Globe,
  Sparkles,
  Info,
  Bell,
  ChevronRight,
  ChevronLeft,
  Upload,
  Zap,
  CheckCircle2,
  AlertCircle,
  History,
  MoreHorizontal,
  Calendar,
  Network,
  ArrowUpRight,
  Wallet,
  X,
  Plus,
  Key,
  RefreshCw,
  Trash,
  Percent,
  User,
  Building,
  Sliders,
  HelpCircle,
  LogOut,
  Check,
  Clock,
  FileText,
  Printer,
  Mail,
  Copy,
  ArrowLeft,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Helper to dynamically get modern icons for specific values or labels
const getOptionIcon = (label: string, value: string, ctx?: { hasRegionOption?: boolean; hasStatusOption?: boolean; hasCategoryOption?: boolean; hasDepartmentOption?: boolean }) => {
  const l = label.toLowerCase();
  const v = value.toLowerCase();

  // Handle "All" option contextually
  if (v === 'all') {
    if (ctx?.hasRegionOption) return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#94a3b8' }} />;
    if (ctx?.hasStatusOption) return <Sliders size={14} className="dropdown-opt-icon" style={{ color: '#94a3b8' }} />;
    if (ctx?.hasCategoryOption) return <Sliders size={14} className="dropdown-opt-icon" style={{ color: '#94a3b8' }} />;
    return null;
  }

  // Expense/Category/Type
  if (l.includes('infrastructure') || l.includes('server') || v === 'infrastructure' || v === 'infra' || v === 'infrastructure_costs' || v === 'infrastructure') return <Server size={14} className="dropdown-opt-icon" />;
  if (l.includes('ai tools') || l.includes('artificial intelligence') || v === 'ai_tools') return <Sparkles size={14} className="dropdown-opt-icon" style={{ color: '#8B5CF6' }} />;
  if (l.includes('software') || l.includes('saas') || v === 'software_licenses' || v === 'software') return <Zap size={14} className="dropdown-opt-icon" style={{ color: '#3B82F6' }} />;
  if (l.includes('marketing') || l.includes('sales') || v === 'marketing') return <Bell size={14} className="dropdown-opt-icon" style={{ color: '#EC4899' }} />;
  if (l.includes('operations') || l.includes('admin') || v === 'operations') return <Sliders size={14} className="dropdown-opt-icon" style={{ color: '#6B7280' }} />;
  if (l.includes('compliance') || l.includes('legal') || v === 'compliance') return <CheckCircle2 size={14} className="dropdown-opt-icon" style={{ color: '#10B981' }} />;
  if (l.includes('amc') || v === 'amc') return <RefreshCw size={14} className="dropdown-opt-icon" />;
  if (l.includes('retainer') || v === 'retainer') return <Briefcase size={14} className="dropdown-opt-icon" />;
  if (l.includes('dedicated') || v === 'dedicated_resource' || v === 'dedicated_team') return <Users size={14} className="dropdown-opt-icon" />;
  if (l.includes('project') || v === 'project') return <TrendingUp size={14} className="dropdown-opt-icon" />;
  if (l.includes('payroll') || v === 'payroll') return <Users size={14} className="dropdown-opt-icon" />;
  
  // Additional Expense Categories
  if (v === 'hosting') return <Server size={14} className="dropdown-opt-icon" style={{ color: '#4F7CFF' }} />;
  if (v === 'internet') return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#10B981' }} />;
  if (v === 'rent') return <Building size={14} className="dropdown-opt-icon" style={{ color: '#FB923C' }} />;
  if (v === 'other') return <HelpCircle size={14} className="dropdown-opt-icon" style={{ color: '#94a3b8' }} />;

  // Department Mappings
  if (v === 'engineering' || v === 'eng') return <Server size={14} className="dropdown-opt-icon" style={{ color: '#3B82F6' }} />;
  if (v === 'design') return <Sparkles size={14} className="dropdown-opt-icon" style={{ color: '#EC4899' }} />;
  if (v === 'product') {
    if (ctx?.hasDepartmentOption) return <Briefcase size={14} className="dropdown-opt-icon" style={{ color: '#10B981' }} />;
    return <Building size={14} className="dropdown-opt-icon" />;
  }
  if (v === 'qa') return <CheckCircle2 size={14} className="dropdown-opt-icon" style={{ color: '#14B8A6' }} />;
  if (v === 'devops') return <Network size={14} className="dropdown-opt-icon" style={{ color: '#8B5CF6' }} />;

  // Billing Model / Revenue Contract Specifics
  if (v === 'hourly') return <Clock size={14} className="dropdown-opt-icon" />;
  if (v === 'fixed_cost') return <DollarSign size={14} className="dropdown-opt-icon" />;
  if (v === 'subscription') return <Zap size={14} className="dropdown-opt-icon" style={{ color: '#3B82F6' }} />;
  if (v === 'consulting') return <Briefcase size={14} className="dropdown-opt-icon" />;

  // Statuses
  if (v === 'active' || v === 'paid' || v === 'collected') return <CheckCircle2 size={14} className="dropdown-opt-icon" style={{ color: '#10B981' }} />;
  if (v === 'paused' || v === 'pending' || v === 'unpaid') return <AlertCircle size={14} className="dropdown-opt-icon" style={{ color: '#F59E0B' }} />;
  if (v === 'ended' || v === 'cancelled' || v === 'overdue') return <X size={14} className="dropdown-opt-icon" style={{ color: '#EF4444' }} />;
  if (v === 'draft') return <FileText size={14} className="dropdown-opt-icon" style={{ color: '#94a3b8' }} />;
  if (v === 'sent') return <Mail size={14} className="dropdown-opt-icon" style={{ color: '#3B82F6' }} />;
  if (v === 'partial') return <Percent size={14} className="dropdown-opt-icon" style={{ color: '#F59E0B' }} />;

  // Currencies
  if (v === 'inr' || l.includes('inr')) return <span className="dropdown-currency-symbol">₹</span>;
  if (v === 'usd' || l.includes('usd')) return <span className="dropdown-currency-symbol">$</span>;
  if (v === 'gbp' || l.includes('gbp')) return <span className="dropdown-currency-symbol">£</span>;
  if (v === 'aed' || l.includes('aed')) return <span className="dropdown-currency-symbol">د.إ</span>;

  // Regions
  if (v === 'us' || l.includes('us')) return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#3B82F6' }} />;
  if (v === 'uk' || l.includes('uk')) return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#10B981' }} />;
  if (v === 'uae' || l.includes('uae')) return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#F59E0B' }} />;
  if (v === 'india' || v === 'in' || l.includes('india')) return <Globe size={14} className="dropdown-opt-icon" style={{ color: '#EF4444' }} />;

  return null;
};

interface PremiumSelectProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  error?: boolean;
  success?: boolean;
  id?: string;
  children?: React.ReactNode;
  noIcons?: boolean;
  alignRight?: boolean;
}

function PremiumSelect({
  value: controlledValue,
  onChange,
  defaultValue = '',
  disabled = false,
  className = '',
  style = {},
  placeholder = 'Select option...',
  error = false,
  success = false,
  id,
  children,
  noIcons = false,
  alignRight = false
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
  };

  // 1. Extract options from children recursively with TS type assertions
  const options: { value: string; label: string; disabled?: boolean }[] = [];
  const parseChildren = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!child) return;
      if (React.isValidElement(child)) {
        const type = child.type;
        if (type === 'option') {
          const optChild = child as React.ReactElement<any>;
          options.push({
            value: String(optChild.props.value ?? ''),
            label: String(optChild.props.children ?? ''),
            disabled: optChild.props.disabled,
          });
        } else if (type === React.Fragment) {
          const fragChild = child as React.ReactElement<any>;
          if (fragChild.props && fragChild.props.children) {
            parseChildren(fragChild.props.children);
          }
        } else {
          const elChild = child as React.ReactElement<any>;
          if (elChild.props && elChild.props.children) {
            parseChildren(elChild.props.children);
          }
        }
      }
    });
  };
  parseChildren(children);

  // Sibling options context to align icons correctly for "All" and "Product" options
  const hasRegionOption = options.some(opt => ['us', 'uk', 'uae', 'india'].includes(opt.value.toLowerCase()));
  const hasStatusOption = options.some(opt => ['active', 'paused', 'ended', 'pending', 'paid', 'collected', 'overdue'].includes(opt.value.toLowerCase()));
  const hasCategoryOption = options.some(opt => ['amc', 'retainer', 'infrastructure', 'ai_tools', 'software_licenses', 'payroll', 'compliance', 'operations'].includes(opt.value.toLowerCase()));
  const hasDepartmentOption = options.some(opt => ['engineering', 'design', 'qa', 'devops'].includes(opt.value.toLowerCase()));
  const iconContext = { hasRegionOption, hasStatusOption, hasCategoryOption, hasDepartmentOption };

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset highlighted index when dropdown opens or filter changes
  useEffect(() => {
    setHighlightedIndex(0);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchQuery]);

  // Find label for currently selected value
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || value);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredOptions.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
          handleValueChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll active/highlighted item into view if needed
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-highlighted="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const showSearch = options.length > 12;

  // Detect compact/filter styles to apply scaling automatically
  const isCompact = (style.height && parseInt(String(style.height)) < 36) || 
                    (style.padding && String(style.padding).includes('3px')) ||
                    (className && className.includes('compact'));

  // Separate trigger specific styles from wrapping styles
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: style.display || 'inline-block',
    width: style.width || '100%',
    minWidth: style.minWidth,
    flexGrow: style.flexGrow,
    flexShrink: style.flexShrink,
    margin: style.margin,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    marginRight: style.marginRight,
  };

  // Filter out wrapper layout properties to apply styling to trigger
  const triggerStyle: React.CSSProperties = {
    ...style,
    width: '100%',
    margin: undefined,
    marginTop: undefined,
    marginBottom: undefined,
    marginLeft: undefined,
    marginRight: undefined,
    flexGrow: undefined,
    flexShrink: undefined,
    // Add default heights and radius if not specified
    height: style.height || (isCompact ? '28px' : '44px'),
    borderRadius: style.borderRadius || (isCompact ? '8px' : '12px'),
  };

  // Dynamically map icon if available
  const currentIcon = noIcons ? null : getOptionIcon(displayLabel, value, iconContext);

  return (
    <div 
      className={`premium-select-wrapper ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      style={wrapperStyle}
      ref={wrapperRef}
      id={id}
    >
      <div
        className={`premium-select-trigger ${error ? 'has-error' : ''} ${success ? 'has-success' : ''}`}
        style={triggerStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
      >
        <div className="premium-select-trigger-content">
          {currentIcon}
          <span className="premium-select-trigger-text">{displayLabel}</span>
        </div>
        <ChevronDown size={isCompact ? 12 : 16} className={`premium-select-chevron ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div 
          className="premium-select-dropdown animate-scale-in"
          style={alignRight ? { right: 0, left: 'auto' } : {}}
        >
          {showSearch && (
            <div className="premium-select-search-wrapper">
              <Search size={14} className="premium-select-search-icon" />
              <input
                type="text"
                className="premium-select-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()} // Prevent closing dropdown on input click
                autoFocus
              />
            </div>
          )}

          <div className="premium-select-options-list" ref={listRef}>
            {filteredOptions.length === 0 ? (
              <div className="premium-select-no-options">No results found</div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isOptHighlighted = index === highlightedIndex;
                const optIcon = noIcons ? null : getOptionIcon(opt.label, opt.value, iconContext);

                return (
                  <div
                    key={opt.value}
                    className={`premium-select-option ${isSelected ? 'is-selected' : ''} ${isOptHighlighted ? 'is-highlighted' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!opt.disabled) {
                        handleValueChange(opt.value);
                        setIsOpen(false);
                      }
                    }}
                    data-highlighted={isOptHighlighted}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="premium-select-option-content">
                      {optIcon}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={14} className="premium-select-check-icon" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MODAL COMPONENTS ---

interface UserProfileModalProps {
  userProfile: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}

function UserProfileModal({ userProfile, onSave, onClose }: UserProfileModalProps) {
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [designation, setDesignation] = useState(userProfile.designation || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [profilePicture, setProfilePicture] = useState(userProfile.profilePicture || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ fullName, designation, email, phoneNumber, profilePicture });
  };

  return (
    <div className="modal-overlay backdrop-animate-enter" onClick={onClose}>
      <div className="modal-content modal-animate-enter" onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-medium)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User style={{ color: 'var(--color-primary)' }} size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>My Profile Settings</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img 
                src={profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuAj2ifRKYHpPPjM6gK7A2TSv_EkoDUC2J0i-P09jQ0-9c11ONaTn8EYEt-eYm_-4hPHyJaiaA4qC4cquwSx0tnP6Tjqg69_nAK3uHZwm7Ju4fNljfdg3Kk-e6B4N-m7HkIFCf2TerlZmXPlkyQaeSbYA_r3Yu94oxBMmoCtqvjQTlFVsfsrUXtq76ecvMvFgtfGTCSAO_i59P_H6BILgHz_bpviVKQXwoEyjap99rhEZDXgrMAAm7Hn1EEWDXntVy2NUjrG0AiQLfYm"} 
                alt="Profile Preview" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
              />
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Profile Picture URL</label>
                <input 
                  type="text" 
                  value={profilePicture} 
                  onChange={(e) => setProfilePicture(e.target.value)} 
                  className="input-premium" 
                  placeholder="Enter image URL"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="input-premium" 
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Designation</label>
              <input 
                type="text" 
                value={designation} 
                onChange={(e) => setDesignation(e.target.value)} 
                className="input-premium" 
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="input-premium" 
                  required
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="input-premium" 
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-input)', flexShrink: 0 }}>
            <button type="submit" className="btn-pill btn-pill-primary" style={{ flex: 1, height: '42px', border: 'none' }}>
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-secondary" style={{ flex: 1, height: '42px', border: '1px solid var(--border-medium)' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CompanyProfileModalProps {
  companyProfile: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}

function CompanyProfileModal({ companyProfile, onSave, onClose }: CompanyProfileModalProps) {
  const [companyName, setCompanyName] = useState(companyProfile.companyName || '');
  const [companyAddress, setCompanyAddress] = useState(companyProfile.companyAddress || '');
  const [website, setWebsite] = useState(companyProfile.website || '');
  const [baseCurrency, setBaseCurrency] = useState(companyProfile.baseCurrency || 'INR');
  const [timeZone, setTimeZone] = useState(companyProfile.timeZone || '');
  const [companyLogo, setCompanyLogo] = useState(companyProfile.companyLogo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ companyName, companyAddress, website, baseCurrency, timeZone, companyLogo });
  };

  return (
    <div className="modal-overlay backdrop-animate-enter" onClick={onClose}>
      <div className="modal-content modal-animate-enter" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-medium)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building style={{ color: 'var(--color-primary)' }} size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Company Profile</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building size={28} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Company Logo URL</label>
                <input 
                  type="text" 
                  value={companyLogo} 
                  onChange={(e) => setCompanyLogo(e.target.value)} 
                  className="input-premium" 
                  placeholder="Enter image URL"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Company Name</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                className="input-premium" 
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Website</label>
                <input 
                  type="url" 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)} 
                  className="input-premium" 
                  placeholder="https://example.com"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Base Currency</label>
                <PremiumSelect 
                  value={baseCurrency} 
                  onChange={(e) => setBaseCurrency(e.target.value)} 
                  className="input-premium"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (AED)</option>
                </PremiumSelect>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Timezone</label>
              <input 
                type="text" 
                value={timeZone} 
                onChange={(e) => setTimeZone(e.target.value)} 
                className="input-premium" 
                placeholder="e.g. UTC+5:30 (Kolkata)"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Company Address</label>
              <textarea 
                value={companyAddress} 
                onChange={(e) => setCompanyAddress(e.target.value)} 
                className="input-premium" 
                rows={2}
                style={{ fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-input)', flexShrink: 0 }}>
            <button type="submit" className="btn-pill btn-pill-primary" style={{ flex: 1, height: '42px', border: 'none' }}>
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-secondary" style={{ flex: 1, height: '42px', border: '1px solid var(--border-medium)' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PreferencesModalProps {
  userPreferences: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}

function PreferencesModal({ userPreferences, onSave, onClose }: PreferencesModalProps) {
  const [theme, setTheme] = useState(userPreferences.theme || 'light');
  const [currencyFormat, setCurrencyFormat] = useState(userPreferences.currencyFormat || 'symbol_prefix');
  const [dateFormat, setDateFormat] = useState(userPreferences.dateFormat || 'YYYY-MM-DD');
  const [startWeekOn, setStartWeekOn] = useState(userPreferences.startWeekOn || 'Monday');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ theme, currencyFormat, dateFormat, startWeekOn });
  };

  return (
    <div className="modal-overlay backdrop-animate-enter" onClick={onClose}>
      <div className="modal-content modal-animate-enter" onClick={(e) => e.stopPropagation()} style={{ width: '420px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-medium)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders style={{ color: 'var(--color-primary)' }} size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Preferences</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>App Theme</label>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-input)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <button 
                  type="button" 
                  onClick={() => setTheme('light')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: theme === 'light' ? 'var(--bg-card)' : 'transparent', color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: theme === 'light' ? 'var(--shadow-soft)' : 'none' }}
                >
                  <span>☀️ Light</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setTheme('dark')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: theme === 'dark' ? 'var(--bg-card)' : 'transparent', color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: theme === 'dark' ? 'var(--shadow-soft)' : 'none' }}
                >
                  <span>🌙 Dark</span>
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Currency Format</label>
              <PremiumSelect 
                value={currencyFormat} 
                onChange={(e) => setCurrencyFormat(e.target.value as any)} 
                className="input-premium"
                style={{ fontSize: '0.85rem' }}
              >
                <option value="symbol_prefix">Symbol Prefix (e.g. ₹5,000)</option>
                <option value="symbol_suffix">Symbol Suffix (e.g. 5,000₹)</option>
                <option value="code_prefix">Code Prefix (e.g. INR 5,000)</option>
                <option value="code_suffix">Code Suffix (e.g. 5,000 INR)</option>
              </PremiumSelect>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Date Format</label>
              <PremiumSelect 
                value={dateFormat} 
                onChange={(e) => setDateFormat(e.target.value as any)} 
                className="input-premium"
                style={{ fontSize: '0.85rem' }}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </PremiumSelect>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Start Week On</label>
              <PremiumSelect 
                value={startWeekOn} 
                onChange={(e) => setStartWeekOn(e.target.value as any)} 
                className="input-premium"
                style={{ fontSize: '0.85rem' }}
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </PremiumSelect>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-input)', flexShrink: 0 }}>
            <button type="submit" className="btn-pill btn-pill-primary" style={{ flex: 1, height: '42px', border: 'none' }}>
              Save Preferences
            </button>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-secondary" style={{ flex: 1, height: '42px', border: '1px solid var(--border-medium)' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface HelpSupportModalProps {
  onClose: () => void;
}

function HelpSupportModal({ onClose }: HelpSupportModalProps) {
  return (
    <div className="modal-overlay backdrop-animate-enter" onClick={onClose}>
      <div className="modal-content modal-animate-enter" onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-medium)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle style={{ color: 'var(--color-primary)' }} size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Help & Support</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Pricing Intelligence Operating System (PIOS)</h4>
            <p style={{ fontSize: '0.85rem' }}>
              PIOS is designed to optimize pricing strategies, resource allocations, and cash flow operations for premium consultancies and service organizations.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Frequently Asked Questions</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block' }}>1. How is the Effective Hourly Burn calculated?</strong>
                <span style={{ fontSize: '0.8rem' }}>It is the sum of workforce salaries (including utilization factors), infrastructure costs, SaaS tooling costs, and overhead divisions divided by total monthly productive hours.</span>
              </div>
              
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block' }}>2. What is the Risk Score?</strong>
                <span style={{ fontSize: '0.8rem' }}>The risk score evaluates workforce utilization margins, client payment delay metrics, and contingency policies to flag potentially underpriced scenarios.</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Contact Support</h4>
            <span style={{ fontSize: '0.82rem' }}>📧 Email: <a href="mailto:support@moonhive.com" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>support@moonhive.com</a></span>
            <span style={{ fontSize: '0.82rem' }}>📞 Phone Support: +91 98765 43210</span>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-input)', display: 'flex', flexShrink: 0 }}>
          <button onClick={onClose} className="btn-pill btn-pill-primary" style={{ width: '100%', height: '40px', border: 'none' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface SignOutConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function SignOutConfirmModal({ onClose, onConfirm }: SignOutConfirmModalProps) {
  return (
    <div className="modal-overlay backdrop-animate-enter" onClick={onClose}>
      <div className="modal-content modal-animate-enter" onClick={(e) => e.stopPropagation()} style={{ width: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut style={{ color: 'var(--color-risk)' }} size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Confirm Sign Out</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <p>Are you sure you want to sign out of the Pricing Intelligence Operating System?</p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={onConfirm} className="btn-pill btn-pill-danger" style={{ flex: 1, height: '38px', padding: '0 12px', border: 'none' }}>
              Sign Out
            </button>
            <button onClick={onClose} className="btn-pill btn-pill-secondary" style={{ flex: 1, height: '38px', padding: '0 12px', border: '1px solid var(--border-medium)' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarDayCellProps {
  cell: any;
  dayEvents: any[];
  isDayToday: boolean;
  isSelected: boolean;
  dayNet: number;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onSelect: () => void;
  formatMoney: (val: number, currency?: string) => string;
  formatMoneyCompact: (val: number, currency?: string) => string;
  setSelectedEvent: (ev: any) => void;
  setIsDetailDrawerOpen: (open: boolean) => void;
  isLastColumn: boolean;
}

function CalendarDayCell({
  cell,
  dayEvents,
  isDayToday,
  isSelected,
  dayNet,
  isExpanded,
  onExpand,
  onCollapse,
  onSelect,
  formatMoney,
  formatMoneyCompact,
  setSelectedEvent,
  setIsDetailDrawerOpen,
  isLastColumn
}: CalendarDayCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>('92px');

  // Sort events by value descending (Priority Rule)
  const sortedEvents = useMemo(() => {
    return [...dayEvents].sort((a, b) => b.amount - a.amount);
  }, [dayEvents]);

  // Adjust max-height smoothly based on expanded state
  useEffect(() => {
    if (isExpanded) {
      if (containerRef.current) {
        setMaxHeight(`${containerRef.current.scrollHeight}px`);
      }
    } else {
      setMaxHeight('92px');
    }
  }, [isExpanded, sortedEvents]);

  const hasMore = sortedEvents.length > 2;
  const moreCount = sortedEvents.length - 2;
  const visibleEvents = isExpanded ? sortedEvents : sortedEvents.slice(0, 2);

  // Background color rules
  let bgVal = 'transparent';
  const dayOfWeek = new Date(cell.dateStr).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (!cell.isCurrentMonth) {
    bgVal = 'rgba(0,0,0,0.01)';
  } else if (isSelected && isDayToday) {
    bgVal = 'rgba(59, 130, 246, 0.08)';
  } else if (isSelected) {
    bgVal = 'rgba(59, 130, 246, 0.04)';
  } else if (isDayToday) {
    bgVal = 'rgba(59, 130, 246, 0.03)';
  } else if (isWeekend) {
    bgVal = 'rgba(148, 163, 184, 0.04)';
  }

  // Box shadow rules
  let shadowVal = 'none';
  if (isSelected && isDayToday) {
    shadowVal = 'inset 0 0 0 2px var(--color-primary)';
  } else if (isSelected) {
    shadowVal = 'inset 0 0 0 2px rgba(59, 130, 246, 0.5)';
  } else if (isDayToday) {
    shadowVal = 'inset 0 0 0 2px rgba(59, 130, 246, 0.25)';
  }

  return (
    <div
      onClick={onSelect}
      style={{
        borderRight: isLastColumn ? 'none' : '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: bgVal,
        boxShadow: shadowVal,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '4px',
        cursor: 'pointer',
        height: '100%',
        overflow: 'hidden'
      }}
      className="calendar-day-cell"
    >
      {/* Day Number Cell Header (flex row with label & daily net position) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', flexShrink: 0 }}>
        {isDayToday ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800
          }}>
            {cell.label}
          </span>
        ) : (
          <span style={{
            fontSize: '0.7rem',
            color: cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: cell.isCurrentMonth ? 700 : 400
          }}>
            {cell.label}
          </span>
        )}

        {/* Daily Net Position Indicator */}
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: dayNet > 0 ? '#10b981' : dayNet < 0 ? '#ef4444' : 'var(--text-muted)'
        }}>
          {formatMoneyCompact(dayNet)}
        </span>
      </div>
      
      {/* Event list */}
      <div 
        ref={containerRef}
        className="calendar-event-list-wrapper"
        style={{ maxHeight }}
      >
        {visibleEvents.map((ev: any, eIdx: number) => {
          const isHiddenInitially = eIdx >= 2;
          return (
            <div
              key={eIdx}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(ev);
                setIsDetailDrawerOpen(true);
              }}
              style={{
                backgroundColor: ev.type === 'receivable_one_time' ? '#e6f7ed' :
                                 ev.type === 'receivable_recurring' ? '#eff6ff' :
                                 ev.type === 'payable_one_time' ? '#fef2f2' : '#fff7ed',
                border: `1px solid ${
                  ev.type === 'receivable_one_time' ? 'rgba(16, 185, 129, 0.25)' :
                  ev.type === 'receivable_recurring' ? 'rgba(59, 130, 246, 0.25)' :
                  ev.type === 'payable_one_time' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)'
                }`,
                borderRadius: '6px',
                padding: '4px 8px',
                margin: '0 4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: ev.type === 'receivable_one_time' ? '#15803d' :
                       ev.type === 'receivable_recurring' ? '#1d4ed8' :
                       ev.type === 'payable_one_time' ? '#b91c1c' : '#c2410c',
              }}
              className={`event-card-hover ${isHiddenInitially ? 'calendar-animate-fade-in' : ''}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                  <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontSize: '0.68rem', fontWeight: 700 }}>
                    {ev.title}
                  </span>
                  {ev.type.includes('recurring') && (
                    <RefreshCw size={8} style={{ flexShrink: 0, opacity: 0.7 }} />
                  )}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.9 }}>
                  {formatMoney(ev.amount)}
                </span>
              </div>
              <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: ev.color,
                flexShrink: 0,
                marginLeft: '4px'
              }} />
            </div>
          );
        })}
        
        {hasMore && !isExpanded && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="calendar-overflow-link"
          >
            +{moreCount} More
          </div>
        )}

        {hasMore && isExpanded && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onCollapse();
            }}
            className="calendar-overflow-link calendar-animate-fade-in"
            style={{ marginTop: '2px' }}
          >
            Show Less
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue' | 'expenses' | 'receivables' | 'payables' | 'simulator' | 'archive' | 'settings' | 'calendar' | 'invoices' | 'customers'>('dashboard');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [compareModeActive, setCompareModeActive] = useState<boolean>(false);
  const [compareScenarioId, setCompareScenarioId] = useState<string>('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'company' | 'preferences' | 'help' | null>(null);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState<boolean>(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [bypassAuth, setBypassAuth] = useState<boolean>(false);

  // --- INVOICES STATE & DEFAULTS ---
  interface InvoiceItem {
    id: string;
    description: string;
    qty: number;
    rate: number;
    taxPercent: number;
    amount: number;
  }

  interface InvoicePayment {
    paymentDate: string;
    amountReceived: number;
    referenceNumber: string;
    notes: string;
  }

  interface Invoice {
    id: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
    billingAddress: string;
    gstTaxId: string;
    currency: string;
    invoiceDate: string;
    dueDate: string;
    paymentTerms: string;
    items: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    dueAmount: number;
    termsAndConditions: string;
    internalNotes: string;
    customerNotes: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
    payments: InvoicePayment[];
    projectName?: string;
    receivableId?: string;
  }

  const mapInvoiceFromDB = (db: any): Invoice => ({
    id: db.id,
    clientName: db.client_name,
    clientEmail: db.client_email || '',
    companyName: db.company_name || '',
    billingAddress: db.billing_address || '',
    gstTaxId: db.gst_tax_id || '',
    currency: db.currency || 'INR',
    invoiceDate: db.invoice_date,
    dueDate: db.due_date,
    paymentTerms: db.payment_terms,
    items: Array.isArray(db.items) ? db.items : [],
    subtotal: Number(db.subtotal),
    taxAmount: Number(db.tax_amount),
    discount: Number(db.discount),
    totalAmount: Number(db.total_amount),
    dueAmount: Number(db.due_amount),
    termsAndConditions: db.terms_and_conditions || '',
    internalNotes: db.internal_notes || '',
    customerNotes: db.customer_notes || '',
    status: db.status as any,
    payments: Array.isArray(db.payments) ? db.payments : [],
    receivableId: db.receivable_id || undefined,
    projectName: db.project_name || undefined
  });

  const mapInvoiceToDB = (inv: Partial<Invoice>) => {
    const db: any = {};
    if (inv.id !== undefined) db.id = inv.id;
    if (inv.clientName !== undefined) db.client_name = inv.clientName;
    if (inv.clientEmail !== undefined) db.client_email = inv.clientEmail;
    if (inv.companyName !== undefined) db.company_name = inv.companyName;
    if (inv.billingAddress !== undefined) db.billing_address = inv.billingAddress;
    if (inv.gstTaxId !== undefined) db.gst_tax_id = inv.gstTaxId;
    if (inv.currency !== undefined) db.currency = inv.currency;
    if (inv.invoiceDate !== undefined) db.invoice_date = inv.invoiceDate;
    if (inv.dueDate !== undefined) db.due_date = inv.dueDate;
    if (inv.paymentTerms !== undefined) db.payment_terms = inv.paymentTerms;
    if (inv.items !== undefined) db.items = inv.items;
    if (inv.subtotal !== undefined) db.subtotal = inv.subtotal;
    if (inv.taxAmount !== undefined) db.tax_amount = inv.taxAmount;
    if (inv.discount !== undefined) db.discount = inv.discount;
    if (inv.totalAmount !== undefined) db.total_amount = inv.totalAmount;
    if (inv.dueAmount !== undefined) db.due_amount = inv.dueAmount;
    if (inv.termsAndConditions !== undefined) db.terms_and_conditions = inv.termsAndConditions;
    if (inv.internalNotes !== undefined) db.internal_notes = inv.internalNotes;
    if (inv.customerNotes !== undefined) db.customer_notes = inv.customerNotes;
    if (inv.status !== undefined) db.status = inv.status;
    if (inv.payments !== undefined) db.payments = inv.payments;
    if (inv.receivableId !== undefined) db.receivable_id = inv.receivableId || null;
    if (inv.projectName !== undefined) db.project_name = inv.projectName || null;
    return db;
  };


  const initialInvoicesList: Invoice[] = [
    {
      id: 'INV-2026-001',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      companyName: 'Acme Corporation',
      billingAddress: '123 Cloud Suite, Silicon Valley, CA',
      gstTaxId: 'US98218201',
      currency: 'INR',
      invoiceDate: '2026-05-17',
      dueDate: '2026-06-01',
      paymentTerms: 'Net 15',
      items: [
        { id: '1', description: 'Cloud Infrastructure Setup & Optimization', qty: 1, rate: 150000, taxPercent: 0, amount: 150000 }
      ],
      subtotal: 150000,
      taxAmount: 0,
      discount: 0,
      totalAmount: 150000,
      dueAmount: 150000,
      termsAndConditions: 'Please transfer within 15 days.',
      internalNotes: 'Initial setup project billing',
      customerNotes: 'Thank you for your business!',
      status: 'Sent',
      payments: [],
      receivableId: 'rec_1',
      projectName: 'Cloud Migration'
    },
    {
      id: 'INV-2026-002',
      clientName: 'Nova Systems',
      clientEmail: 'accounts@novasystems.io',
      companyName: 'Nova Systems Inc',
      billingAddress: 'Suite 404, Tech Park, Boston, MA',
      gstTaxId: 'US77182910',
      currency: 'INR',
      invoiceDate: '2026-05-24',
      dueDate: '2026-06-08',
      paymentTerms: 'Net 15',
      items: [
        { id: '1', description: 'AI Agent System Architecture Blueprint', qty: 1, rate: 80000, taxPercent: 0, amount: 80000 }
      ],
      subtotal: 80000,
      taxAmount: 0,
      discount: 0,
      totalAmount: 80000,
      dueAmount: 80000,
      termsAndConditions: 'Net 15. Standard terms apply.',
      internalNotes: 'Design phase milestone payment',
      customerNotes: 'Please let us know if any revisions are needed.',
      status: 'Sent',
      payments: [],
      receivableId: 'rec_2',
      projectName: 'AI Agent Integration'
    },
    {
      id: 'INV-2026-003',
      clientName: 'Globex Ltd',
      clientEmail: 'billing@globex.co.uk',
      companyName: 'Globex Limited',
      billingAddress: '77 Canary Wharf, London, UK',
      gstTaxId: 'GB22910283',
      currency: 'INR',
      invoiceDate: '2026-05-28',
      dueDate: '2026-06-12',
      paymentTerms: 'Net 15',
      items: [
        { id: '1', description: 'UX Design System Sprint 1 & 2', qty: 1, rate: 250000, taxPercent: 0, amount: 250000 }
      ],
      subtotal: 250000,
      taxAmount: 0,
      discount: 0,
      totalAmount: 250000,
      dueAmount: 150000,
      termsAndConditions: 'Net 15. 50% advance, 50% on delivery.',
      internalNotes: 'UX team retainer',
      customerNotes: 'Milestone 1 invoice.',
      status: 'Partial',
      payments: [
        { paymentDate: '2026-06-02', amountReceived: 100000, referenceNumber: 'TXN-90182', notes: 'First partial payment' }
      ],
      receivableId: 'rec_3',
      projectName: 'UX Revamp & Retainer'
    },
    {
      id: 'INV-2026-004',
      clientName: 'Cyberdyne Corp',
      clientEmail: 'admin@cyberdyne.co.jp',
      companyName: 'Cyberdyne Corp',
      billingAddress: 'Cyberdyne HQ, Tokyo, Japan',
      gstTaxId: 'JP11290382',
      currency: 'INR',
      invoiceDate: '2026-06-08',
      dueDate: '2026-06-23',
      paymentTerms: 'Net 15',
      items: [
        { id: '1', description: 'Security Audit & Server Maintenance Support', qty: 1, rate: 120000, taxPercent: 0, amount: 120000 }
      ],
      subtotal: 120000,
      taxAmount: 0,
      discount: 0,
      totalAmount: 120000,
      dueAmount: 0,
      termsAndConditions: 'Thank you for your prompt payment.',
      internalNotes: 'Annual renewal support',
      customerNotes: 'Invoice paid in full.',
      status: 'Paid',
      payments: [
        { paymentDate: '2026-06-09', amountReceived: 120000, referenceNumber: 'TXN-77291', notes: 'Paid in full' }
      ],
      receivableId: 'rec_4',
      projectName: 'Server AMC Support'
    },
    {
      id: 'INV-2026-005',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      companyName: 'Acme Corporation',
      billingAddress: '123 Cloud Suite, Silicon Valley, CA',
      gstTaxId: 'US98218201',
      currency: 'INR',
      invoiceDate: '2026-06-07',
      dueDate: '2026-06-22',
      paymentTerms: 'Net 15',
      items: [
        { id: '1', description: 'Website Redesign Proposal and Wireframes', qty: 1, rate: 95000, taxPercent: 0, amount: 95000 }
      ],
      subtotal: 95000,
      taxAmount: 0,
      discount: 0,
      totalAmount: 95000,
      dueAmount: 95000,
      termsAndConditions: 'Draft invoice. Not yet finalized.',
      internalNotes: 'Draft version to be reviewed by account manager',
      customerNotes: 'Wireframes review invoice draft.',
      status: 'Draft',
      payments: [],
      receivableId: undefined,
      projectName: 'Brand Redesign'
    }
  ];

  const defaultInvoiceForm: Omit<Invoice, 'id'> = {
    clientName: '',
    clientEmail: '',
    companyName: '',
    billingAddress: '',
    gstTaxId: '',
    currency: 'INR',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Net 15',
    items: [{ id: '1', description: '', qty: 1, rate: 0, taxPercent: 0, amount: 0 }],
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    totalAmount: 0,
    dueAmount: 0,
    termsAndConditions: '1. Please pay within the due date.\n2. Interest of 1.5% per month will be charged on late payments.',
    internalNotes: '',
    customerNotes: 'Thank you for your business!',
    status: 'Draft',
    payments: []
  };

  // --- CUSTOMERS STATE & DEFAULTS ---
  interface Customer {
    id: string;
    name: string;
    companyName: string;
    customerType: 'AMC' | 'Retainer' | 'Project' | 'Dedicated Resource' | 'Product' | 'Other';
    industry: string;
    website: string;
    region: string;
    status: 'Active' | 'Inactive';
    contactPerson: string;
    designation: string;
    email: string;
    phone: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    gstNumber: string;
    taxId: string;
    currency: string;
    paymentTerms: 'Net 15' | 'Net 30' | 'Net 45' | 'Custom';
    internalNotes: string;
    customerNotes: string;
    createdAt: string;
  }

  const mapCustomerFromDB = (db: any): Customer => ({
    id: db.id,
    name: db.name,
    companyName: db.company_name || '',
    customerType: db.customer_type as any,
    industry: db.industry || '',
    website: db.website || '',
    region: db.region || '',
    status: db.status as any,
    contactPerson: db.contact_person || '',
    designation: db.designation || '',
    email: db.email || '',
    phone: db.phone || '',
    mobile: db.mobile || '',
    address: db.address || '',
    city: db.city || '',
    state: db.state || '',
    country: db.country || '',
    postalCode: db.postal_code || '',
    gstNumber: db.gst_number || '',
    taxId: db.tax_id || '',
    currency: db.currency || 'INR',
    paymentTerms: db.payment_terms as any,
    internalNotes: db.internal_notes || '',
    customerNotes: db.customer_notes || '',
    createdAt: db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const mapCustomerToDB = (cust: Partial<Customer>) => {
    const db: any = {};
    if (cust.name !== undefined) db.name = cust.name;
    if (cust.companyName !== undefined) db.company_name = cust.companyName;
    if (cust.customerType !== undefined) db.customer_type = cust.customerType;
    if (cust.industry !== undefined) db.industry = cust.industry;
    if (cust.website !== undefined) db.website = cust.website;
    if (cust.region !== undefined) db.region = cust.region;
    if (cust.status !== undefined) db.status = cust.status;
    if (cust.contactPerson !== undefined) db.contact_person = cust.contactPerson;
    if (cust.designation !== undefined) db.designation = cust.designation;
    if (cust.email !== undefined) db.email = cust.email;
    if (cust.phone !== undefined) db.phone = cust.phone;
    if (cust.mobile !== undefined) db.mobile = cust.mobile;
    if (cust.address !== undefined) db.address = cust.address;
    if (cust.city !== undefined) db.city = cust.city;
    if (cust.state !== undefined) db.state = cust.state;
    if (cust.country !== undefined) db.country = cust.country;
    if (cust.postalCode !== undefined) db.postal_code = cust.postalCode;
    if (cust.gstNumber !== undefined) db.gst_number = cust.gstNumber;
    if (cust.taxId !== undefined) db.tax_id = cust.taxId;
    if (cust.currency !== undefined) db.currency = cust.currency;
    if (cust.paymentTerms !== undefined) db.payment_terms = cust.paymentTerms;
    if (cust.internalNotes !== undefined) db.internal_notes = cust.internalNotes;
    if (cust.customerNotes !== undefined) db.customer_notes = cust.customerNotes;
    return db;
  };

  const initialCustomers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'Acme Corp',
      companyName: 'Acme Corporation',
      customerType: 'Project',
      industry: 'Technology',
      website: 'https://acme.com',
      region: 'US',
      status: 'Active',
      contactPerson: 'John Doe',
      designation: 'Billing Manager',
      email: 'billing@acme.com',
      phone: '+1-555-0199',
      mobile: '+1-555-0198',
      address: '123 Cloud Suite',
      city: 'Silicon Valley',
      state: 'CA',
      country: 'USA',
      postalCode: '94025',
      gstNumber: 'US98218201',
      taxId: 'TX-98218201',
      currency: 'INR',
      paymentTerms: 'Net 15',
      internalNotes: 'Initial customer imported from mock invoice data.',
      customerNotes: 'Prefers electronic invoicing.',
      createdAt: '2026-05-17'
    },
    {
      id: 'CUST-002',
      name: 'Nova Systems',
      companyName: 'Nova Systems Inc',
      customerType: 'AMC',
      industry: 'Software Development',
      website: 'https://novasystems.com',
      region: 'UK',
      status: 'Active',
      contactPerson: 'Jane Smith',
      designation: 'Director of Finance',
      email: 'accounts@novasystems.com',
      phone: '+44-20-7946-0958',
      mobile: '+44-7911-123456',
      address: '45 Tech Way',
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      postalCode: 'EC1A 1BB',
      gstNumber: 'GB123456789',
      taxId: 'TAX-GB123456',
      currency: 'USD',
      paymentTerms: 'Net 30',
      internalNotes: 'Key AMC account in the UK.',
      customerNotes: 'Requires purchase order numbers on all invoices.',
      createdAt: '2026-05-20'
    },
    {
      id: 'CUST-003',
      name: 'Globex Ltd',
      companyName: 'Globex Corporation',
      customerType: 'Retainer',
      industry: 'Logistics',
      website: 'https://globex.com',
      region: 'UAE',
      status: 'Active',
      contactPerson: 'Bob Johnson',
      designation: 'Accounts Payable',
      email: 'payables@globex.com',
      phone: '+971-4-123-4567',
      mobile: '+971-50-123-4567',
      address: '78 Desert Road',
      city: 'Dubai',
      state: 'Dubai',
      country: 'UAE',
      postalCode: '00000',
      gstNumber: 'AE987654321',
      taxId: 'TAX-AE987654',
      currency: 'AED',
      paymentTerms: 'Net 45',
      internalNotes: 'Retainer client based in Dubai.',
      customerNotes: 'Invoices should be in AED.',
      createdAt: '2026-05-25'
    },
    {
      id: 'CUST-004',
      name: 'Cyberdyne Corp',
      companyName: 'Cyberdyne Systems',
      customerType: 'Dedicated Resource',
      industry: 'Robotics',
      website: 'https://cyberdyne.com',
      region: 'India',
      status: 'Active',
      contactPerson: 'Sarah Connor',
      designation: 'Finance Operations',
      email: 'finance@cyberdyne.com',
      phone: '+91-80-1234-5678',
      mobile: '+91-98765-43210',
      address: '99 Automation Street',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
      gstNumber: '29AAAAA1111A1Z1',
      taxId: 'TAX-IN1111',
      currency: 'INR',
      paymentTerms: 'Custom',
      internalNotes: 'Sarah Connor handles finance.',
      customerNotes: 'Prefers invoices in INR.',
      createdAt: '2026-06-01'
    }
  ];

  const defaultCustomerForm: Omit<Customer, 'id' | 'createdAt'> = {
    name: '',
    companyName: '',
    customerType: 'Project',
    industry: '',
    website: '',
    region: 'India',
    status: 'Active',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    gstNumber: '',
    taxId: '',
    currency: 'INR',
    paymentTerms: 'Net 15',
    internalNotes: '',
    customerNotes: ''
  };

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('salezy-customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialCustomers;
  });

  useEffect(() => {
    localStorage.setItem('salezy-customers', JSON.stringify(customers));
  }, [customers]);

  const [customerViewMode, setCustomerViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id' | 'createdAt'> & { id?: string }>(defaultCustomerForm);

  // Customer filters
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [customerRegionFilter, setCustomerRegionFilter] = useState<string>('all');
  const [customerIndustryFilter, setCustomerIndustryFilter] = useState<string>('all');

  const [customerProfileTab, setCustomerProfileTab] = useState<'overview' | 'invoices' | 'receivables' | 'estimates'>('overview');

  const uniqueCustomerRegions = useMemo(() => {
    const regions = new Set<string>();
    customers.forEach(c => { if (c.region) regions.add(c.region); });
    return Array.from(regions);
  }, [customers]);

  const uniqueCustomerIndustries = useMemo(() => {
    const industries = new Set<string>();
    customers.forEach(c => { if (c.industry) industries.add(c.industry); });
    return Array.from(industries);
  }, [customers]);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('salezy-invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialInvoicesList;
  });

  const [invoiceViewMode, setInvoiceViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState<Omit<Invoice, 'id'> & { id?: string }>(defaultInvoiceForm);
  const [enterInvoiceClientManually, setEnterInvoiceClientManually] = useState<boolean>(false);
  const [enterEstimateClientManually, setEnterEstimateClientManually] = useState<boolean>(false);
  
  // Listing filter states
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState<string>('all');
  const [invoiceClientFilter, setInvoiceClientFilter] = useState<string>('all');
  const [invoiceAmountFilter, setInvoiceAmountFilter] = useState<string>('all');

  // Record Payment Modal State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amountReceived: 0,
    referenceNumber: '',
    notes: ''
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('salezy-invoices', JSON.stringify(invoices));
  }, [invoices]);
  
  // Executive Insights Storytelling Widget States
  const [activeInsightIndex, setActiveInsightIndex] = useState<number>(0);
  const [isChartTransitioning, setIsChartTransitioning] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isMouseOverChart, setIsMouseOverChart] = useState<boolean>(false);
  const [lastChartInteractionTime, setLastChartInteractionTime] = useState<number>(Date.now());

  // Consolidated Executive Insights storytelling hook (rotation & auto-resume)
  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    let secondsElapsed = 0;
    
    const interval = setInterval(() => {
      // 1. Auto-resume after 10s of inactivity
      if (!isAutoRotating) {
        if (!isMouseOverChart && Date.now() - lastChartInteractionTime >= 10000) {
          setIsAutoRotating(true);
          secondsElapsed = 0;
        }
        return;
      }

      // 2. Auto-rotate every 8 seconds
      secondsElapsed += 1;
      if (secondsElapsed >= 8) {
        secondsElapsed = 0;
        
        setIsChartTransitioning(true);
        setTimeout(() => {
          setActiveInsightIndex((prev) => (prev + 1) % 6);
          setTimeout(() => {
            setIsChartTransitioning(false);
          }, 150);
        }, 150);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRotating, isMouseOverChart, lastChartInteractionTime, activeTab]);
  
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-avatar-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileDropdownOpen]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCompactMoney = (val: number) => {
    const symbol = baseCurrency === 'INR' ? '₹' : baseCurrency === 'GBP' ? '£' : '$';
    if (val >= 1000000) {
      return `${symbol}${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `${symbol}${(val / 1000).toFixed(0)}k`;
    }
    return `${symbol}${val}`;
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    project: true,
    resources: true,
    profitability: true,
    milestones: true
  });

  const [resourcesTab, setResourcesTab] = useState<'hr' | 'ai' | 'saas' | 'infra' | 'other'>('hr');

  const [activeAiTools, setActiveAiTools] = useState<Record<string, { active: boolean; cost: number }>>({
    Cursor: { active: true, cost: 1670 },
    ChatGPT: { active: true, cost: 1670 },
    Claude: { active: true, cost: 1670 },
    Gemini: { active: true, cost: 1670 },
    Perplexity: { active: false, cost: 1670 },
    Custom: { active: false, cost: 5000 }
  });

  const [activeSaasTools, setActiveSaasTools] = useState<Record<string, { active: boolean; cost: number }>>({
    Jira: { active: true, cost: 670 },
    Figma: { active: true, cost: 1250 },
    Slack: { active: true, cost: 500 },
    Notion: { active: true, cost: 830 },
    Hubspot: { active: false, cost: 4100 },
    Zoho: { active: false, cost: 2500 }
  });

  const [activeInfra, setActiveInfra] = useState<Record<string, { active: boolean; cost: number }>>({
    AWS: { active: true, cost: 12500 },
    Azure: { active: false, cost: 12500 },
    Vercel: { active: true, cost: 1670 },
    'Digital Ocean': { active: false, cost: 2500 },
    Cloudflare: { active: true, cost: 1670 },
    'Custom Infra': { active: false, cost: 10000 }
  });

  const [activeOtherCosts, setActiveOtherCosts] = useState<Record<string, number>>({
    Travel: 2500,
    Compliance: 5000,
    Licensing: 0,
    'Third-party Vendors': 0,
    Subcontractors: 0,
    Miscellaneous: 2500
  });


  // Cash Flow Calendar States
  const [financialHubExpanded, setFinancialHubExpanded] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<string>('2026-06');

  const handlePrevMonth = () => {
    const months = ['2026-05', '2026-06', '2026-07', '2026-08'];
    const idx = months.indexOf(currentMonth);
    if (idx > 0) {
      setCurrentMonth(months[idx - 1]);
      setExpandedCalDate(null);
    }
  };

  const handleNextMonth = () => {
    const months = ['2026-05', '2026-06', '2026-07', '2026-08'];
    const idx = months.indexOf(currentMonth);
    if (idx < months.length - 1) {
      setCurrentMonth(months[idx + 1]);
      setExpandedCalDate(null);
    }
  };

  const [calTypeFilter, setCalTypeFilter] = useState<string>('all');
  const [calStatusFilter, setCalStatusFilter] = useState<string>('all');
  const [calCategoryFilter, setCalCategoryFilter] = useState<string>('all');
  const [calClientFilter, setCalClientFilter] = useState<string>('all');
  const [calAmountRange, setCalAmountRange] = useState<string>('all');
  const [calRegionFilter, setCalRegionFilter] = useState<string>('all');
  const [calSearchQuery, setCalSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [calDrawerEditMode, setCalDrawerEditMode] = useState<boolean>(false);
  const [calDrawerFormName, setCalDrawerFormName] = useState<string>('');
  const [calDrawerFormAmount, setCalDrawerFormAmount] = useState<string>('');
  const [calDrawerFormDate, setCalDrawerFormDate] = useState<string>('');

  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);
  const [expandedCalDate, setExpandedCalDate] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const calendarTabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (selectedCalDate && calendarTabRef.current && !calendarTabRef.current.contains(e.target as Node)) {
        setSelectedCalDate(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedCalDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCalDate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Zustand Store states & actions
  const {
    baseCurrency,
    setBaseCurrency,
    exchangeRates,
    updateExchangeRate,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    infraServices,
    addInfraService,
    deleteInfraService,
    saasTools,
    addSaasTool,
    deleteSaasTool,
    overheads,
    addOverhead,
    deleteOverhead,
    marginPolicy,
    benchmarks,
    projectEstimate,
    updateProjectEstimate,
    allocatedResources,
    addAllocatedResource,
    updateAllocatedResource,
    deleteAllocatedResource,
    milestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    setMilestonesPreset,
    metrics,
    recompute,
    savedEstimates,
    saveActiveEstimate,
    deleteArchivedEstimate,
    loadArchivedEstimate,
    recurringRevenues,
    addRecurringRevenue,
    deleteRecurringRevenue,
    recurringExpenses,
    addRecurringExpense,
    deleteRecurringExpense,
    receivables,
    addReceivable,
    updateReceivable,
    deleteReceivable,
    payables,
    addPayable,
    updatePayable,
    deletePayable,
    updateRecurringRevenue,
    updateRecurringExpense,
    userProfile,
    companyProfile,
    userPreferences,
    updateUserProfile,
    updateCompanyProfile,
    updateUserPreferences,
    fetchInitialData,
    addAuditLog,
    auditLogs
  } = usePricingStore();

  // --- SUPABASE AUTH & SSO gating ---
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then((res: any) => {
      setSession(res.data?.session || null);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Synchronize userProfile with Supabase Auth Session
  useEffect(() => {
    if (session?.user) {
      const email = session.user.email || '';
      const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
      const avatar = session.user.user_metadata?.avatar_url || '';
      
      updateUserProfile({
        email,
        fullName,
        profilePicture: avatar || userProfile.profilePicture || ''
      });
    }
  }, [session, updateUserProfile, userProfile.profilePicture]);

  // Fetch initial data from Supabase DB on mount / login
  useEffect(() => {
    if (authLoading) return;
    if (!session && !bypassAuth) return;

    const initDB = async () => {
      await fetchInitialData();
      if (isSupabaseConfigured()) {
        try {
          const { data: custData, error: custError } = await supabase.from('customers').select('*');
          if (!custError && custData) {
            setCustomers(custData.map(mapCustomerFromDB));
          } else if (custError) {
            console.error('Error fetching customers from Supabase:', custError);
          }

          const { data: invData, error: invError } = await supabase.from('invoices').select('*');
          if (!invError && invData) {
            setInvoices(invData.map(mapInvoiceFromDB));
          } else if (invError) {
            console.error('Error fetching invoices from Supabase:', invError);
          }
        } catch (err) {
          console.error('Failed to load customers/invoices from Supabase:', err);
        }
      }
    };
    initDB();
  }, [fetchInitialData, session, bypassAuth, authLoading]);

  // Handle printing view modes automatically
  useEffect(() => {
    const handleBeforePrint = () => {
      if (activeTab === 'invoices') {
        document.body.classList.add('printing-invoice');
      } else if (activeTab === 'simulator') {
        document.body.classList.add('printing-estimate');
      }
    };
    
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-invoice');
      document.body.classList.remove('printing-estimate');
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [activeTab]);

  // --- INVOICE INTEGRATION & SYNCHRONIZATION ROUTINES ---
  
  // Sync initial mock invoices with store receivables on mount
  useEffect(() => {
    invoices.forEach(inv => {
      if (inv.receivableId) {
        const rec = receivables.find(r => r.id === inv.receivableId);
        if (rec) {
          const dueAmt = inv.totalAmount - inv.payments.reduce((sum, p) => sum + p.amountReceived, 0);
          const recStatus = inv.status === 'Paid' ? 'paid' : (inv.status === 'Overdue' ? 'overdue' : 'unpaid');
          if (rec.amount !== dueAmt || rec.status !== recStatus) {
            updateReceivable(inv.receivableId, {
              amount: dueAmt,
              status: recStatus
            });
          }
        }
      }
    });
  }, []); // Run once on mount

  const syncInvoiceToReceivables = (inv: Invoice, action: 'create' | 'update' | 'delete') => {
    if (action === 'delete') {
      if (inv.receivableId) {
        deleteReceivable(inv.receivableId);
      }
      return;
    }

    if (inv.status === 'Draft' || inv.status === 'Cancelled') {
      if (inv.receivableId) {
        deleteReceivable(inv.receivableId);
        if (isSupabaseConfigured()) {
          supabase.from('invoices').update({ receivable_id: null }).eq('id', inv.id)
            .then((res: any) => { if (res.error) console.error('Error clearing DB receivable_id:', res.error); });
        }
        inv.receivableId = undefined;
      }
      return;
    }

    const dueAmt = inv.totalAmount - inv.payments.reduce((sum, p) => sum + p.amountReceived, 0);
    
    // Determine status
    let recStatus: 'unpaid' | 'paid' | 'overdue' = 'unpaid';
    if (inv.status === 'Paid' || dueAmt === 0) {
      recStatus = 'paid';
    } else {
      const todayStr = '2026-06-07'; // current simulated system date
      if (inv.dueDate < todayStr) {
        recStatus = 'overdue';
      } else {
        recStatus = 'unpaid';
      }
    }

    // Determine collection risk
    let collectionRisk: 'high' | 'medium' | 'low' = 'low';
    const today = new Date('2026-06-07');
    const due = new Date(inv.dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) collectionRisk = 'high';
    else if (diffDays > 0) collectionRisk = 'medium';

    if (inv.receivableId) {
      // Update existing
      updateReceivable(inv.receivableId, {
        client: inv.clientName,
        invoice: inv.id,
        amount: dueAmt,
        dueDate: inv.dueDate,
        status: recStatus,
        daysOutstanding: diffDays > 0 ? diffDays : 0,
        collectionRisk
      });
    } else {
      // Add new
      addReceivable({
        client: inv.clientName,
        invoice: inv.id,
        amount: dueAmt,
        currency: inv.currency,
        dueDate: inv.dueDate,
        status: recStatus,
        daysOutstanding: diffDays > 0 ? diffDays : 0,
        collectionRisk
      });

      // Find the created receivable by its invoice ID and link it
      setTimeout(() => {
        const storeReceivables = usePricingStore.getState().receivables;
        const matchingRec = storeReceivables.find(r => r.invoice === inv.id);
        if (matchingRec) {
          if (isSupabaseConfigured()) {
            supabase.from('invoices').update({ receivable_id: matchingRec.id }).eq('id', inv.id)
              .then((res: any) => { if (res.error) console.error('Error updating DB receivable_id:', res.error); });
          }
          setInvoices(current => {
            const updated = current.map(item => {
              if (item.id === inv.id) {
                return { ...item, receivableId: matchingRec.id };
              }
              return item;
            });
            localStorage.setItem('salezy-invoices', JSON.stringify(updated));
            return updated;
          });
        }
      }, 100);
    }
  };

  // Dynamically compile invoices list using filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (invoiceSearchQuery) {
        const query = invoiceSearchQuery.toLowerCase();
        const numMatch = inv.id.toLowerCase().includes(query);
        const clientMatch = inv.clientName.toLowerCase().includes(query);
        const projMatch = (inv.projectName || '').toLowerCase().includes(query);
        if (!numMatch && !clientMatch && !projMatch) return false;
      }

      if (invoiceStatusFilter !== 'all') {
        if (inv.status.toLowerCase() !== invoiceStatusFilter.toLowerCase()) return false;
      }

      if (invoiceClientFilter !== 'all') {
        if (inv.clientName !== invoiceClientFilter) return false;
      }

      if (invoiceAmountFilter !== 'all') {
        if (invoiceAmountFilter === 'under_10k' && inv.totalAmount >= 10000) return false;
        if (invoiceAmountFilter === '10k_100k' && (inv.totalAmount < 10000 || inv.totalAmount > 100000)) return false;
        if (invoiceAmountFilter === 'over_100k' && inv.totalAmount <= 100000) return false;
      }

      if (invoiceDateFilter !== 'all') {
        const date = new Date(inv.invoiceDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-indexed

        const currentYear = 2026;

        if (invoiceDateFilter === 'This Month') {
          if (year !== currentYear || month !== 6) return false;
        } else if (invoiceDateFilter === 'Last Month') {
          if (year !== currentYear || month !== 5) return false;
        } else if (invoiceDateFilter === 'Quarter') {
          if (year !== currentYear || month < 4 || month > 6) return false;
        } else if (invoiceDateFilter === 'Year') {
          if (year !== currentYear) return false;
        }
      }

      return true;
    });
  }, [invoices, invoiceSearchQuery, invoiceStatusFilter, invoiceClientFilter, invoiceAmountFilter, invoiceDateFilter]);

  // Compute Invoice KPI metrics
  const invoiceKPIs = useMemo(() => {
    const activeInvoices = invoices.filter(inv => inv.status !== 'Cancelled');
    
    let totalInvoicesAmt = 0;
    let totalPaidAmt = 0;
    let pendingCollectionAmt = 0;
    let overdueAmt = 0;
    
    const todayStr = '2026-06-07';

    activeInvoices.forEach(inv => {
      const total = inv.totalAmount;
      const paid = inv.payments.reduce((sum, p) => sum + p.amountReceived, 0);
      const balance = total - paid;

      totalInvoicesAmt += total;
      totalPaidAmt += paid;

      if (inv.status === 'Sent' || inv.status === 'Partial' || inv.status === 'Overdue') {
        pendingCollectionAmt += balance;
      }

      if (inv.status === 'Overdue' || (inv.dueDate < todayStr && inv.status !== 'Paid' && inv.status !== 'Draft')) {
        overdueAmt += balance;
      }
    });

    return {
      totalInvoices: totalInvoicesAmt,
      totalCount: activeInvoices.length,
      paidInvoices: totalPaidAmt,
      pendingCollection: pendingCollectionAmt,
      overdueAmount: overdueAmt
    };
  }, [invoices]);

  // Client list extracted dynamically for filter selection
  const uniqueInvoiceClients = useMemo(() => {
    const clients = new Set<string>();
    invoices.forEach(inv => {
      if (inv.clientName) {
        clients.add(inv.clientName);
      }
    });
    return Array.from(clients);
  }, [invoices]);

  // --- INVOICE ACTIONS & EVENT HANDLERS ---
  
  const duplicateInvoice = async (inv: Invoice) => {
    const nextNum = invoices.length + 1;
    const newId = `INV-2026-${nextNum.toString().padStart(3, '0')}`;
    const dup: Invoice = {
      ...inv,
      id: newId,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payments: [],
      dueAmount: inv.totalAmount,
      status: 'Draft',
      receivableId: undefined
    };
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('invoices').insert(mapInvoiceToDB(dup));
      if (error) console.error('Error duplicating invoice in DB:', error);
    }
    addAuditLog({
      entityType: 'Invoice',
      entityId: dup.id,
      actionType: 'create',
      changeSummary: `Duplicated invoice as draft '${dup.id}' (client: ${dup.clientName})`
    });
    setInvoices(current => [...current, dup]);
    alert(`Duplicated invoice as ${newId} (Draft)`);
  };

  const deleteInvoice = async (inv: Invoice) => {
    if (confirm(`Are you sure you want to delete invoice ${inv.id}?`)) {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('invoices').delete().eq('id', inv.id);
        if (error) console.error('Error deleting invoice from DB:', error);
      }
      addAuditLog({
        entityType: 'Invoice',
        entityId: inv.id,
        actionType: 'delete',
        changeSummary: `Deleted invoice '${inv.id}' (client: ${inv.clientName})`
      });
      setInvoices(current => current.filter(i => i.id !== inv.id));
      syncInvoiceToReceivables(inv, 'delete');
    }
  };

  const populateInvoiceForm = (inv: Invoice) => {
    setInvoiceForm({
      id: inv.id,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      companyName: inv.companyName,
      billingAddress: inv.billingAddress,
      gstTaxId: inv.gstTaxId,
      currency: inv.currency,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      paymentTerms: inv.paymentTerms,
      items: [...inv.items],
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      discount: inv.discount,
      totalAmount: inv.totalAmount,
      dueAmount: inv.dueAmount,
      termsAndConditions: inv.termsAndConditions,
      internalNotes: inv.internalNotes,
      customerNotes: inv.customerNotes,
      status: inv.status,
      payments: [...inv.payments],
      receivableId: inv.receivableId,
      projectName: inv.projectName
    });
  };

  const calculateFormTotals = (items: InvoiceItem[], discount: number) => {
    let subtotal = 0;
    let taxAmount = 0;
    items.forEach(item => {
      const lineSub = item.qty * item.rate;
      const lineTax = lineSub * (item.taxPercent / 100);
      subtotal += lineSub;
      taxAmount += lineTax;
    });
    const total = subtotal + taxAmount - discount;
    return {
      subtotal,
      taxAmount,
      totalAmount: total > 0 ? total : 0
    };
  };

  const handleInvoiceFormItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = invoiceForm.items.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: value };
        const qty = field === 'qty' ? parseInt(value) || 0 : item.qty;
        const rate = field === 'rate' ? parseFloat(value) || 0 : item.rate;
        const tax = field === 'taxPercent' ? parseFloat(value) || 0 : item.taxPercent;
        updatedItem.amount = qty * rate * (1 + tax / 100);
        return updatedItem;
      }
      return item;
    });

    const totals = calculateFormTotals(newItems, invoiceForm.discount);
    setInvoiceForm(current => ({
      ...current,
      items: newItems,
      ...totals
    }));
  };

  const addInvoiceFormItem = () => {
    const newItems = [
      ...invoiceForm.items,
      { id: Date.now().toString(), description: '', qty: 1, rate: 0, taxPercent: 0, amount: 0 }
    ];
    setInvoiceForm(current => ({
      ...current,
      items: newItems
    }));
  };

  const removeInvoiceFormItem = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    const newItems = invoiceForm.items.filter((_, idx) => idx !== index);
    const totals = calculateFormTotals(newItems, invoiceForm.discount);
    setInvoiceForm(current => ({
      ...current,
      items: newItems,
      ...totals
    }));
  };

  const handleDiscountChange = (val: number) => {
    const totals = calculateFormTotals(invoiceForm.items, val);
    setInvoiceForm(current => ({
      ...current,
      discount: val,
      ...totals
    }));
  };

  const handleSaveInvoice = async (status: 'Draft' | 'Sent') => {
    if (!invoiceForm.clientName) {
      alert('Client Name is required.');
      return;
    }

    const todayStr = '2026-06-07';
    if (invoiceForm.id) {
      // Editing
      let finalStatus: Invoice['status'] = status;
      if (status === 'Sent' && invoiceForm.dueDate < todayStr) {
        finalStatus = 'Overdue';
      }
      
      const existing = invoices.find(i => i.id === invoiceForm.id);
      if (existing && (existing.status === 'Paid' || existing.status === 'Partial')) {
        finalStatus = existing.status;
      }

      const updatedInvoice: Invoice = {
        id: invoiceForm.id,
        clientName: invoiceForm.clientName,
        clientEmail: invoiceForm.clientEmail,
        companyName: invoiceForm.companyName,
        billingAddress: invoiceForm.billingAddress,
        gstTaxId: invoiceForm.gstTaxId,
        currency: invoiceForm.currency,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        paymentTerms: invoiceForm.paymentTerms,
        items: invoiceForm.items,
        subtotal: invoiceForm.subtotal,
        taxAmount: invoiceForm.taxAmount,
        discount: invoiceForm.discount,
        totalAmount: invoiceForm.totalAmount,
        dueAmount: invoiceForm.totalAmount - (invoiceForm.payments || []).reduce((s, p) => s + p.amountReceived, 0),
        termsAndConditions: invoiceForm.termsAndConditions,
        internalNotes: invoiceForm.internalNotes,
        customerNotes: invoiceForm.customerNotes,
        status: finalStatus,
        payments: invoiceForm.payments || [],
        receivableId: invoiceForm.receivableId,
        projectName: invoiceForm.projectName
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('invoices').update(mapInvoiceToDB(updatedInvoice)).eq('id', invoiceForm.id);
        if (error) console.error('Error updating invoice in DB:', error);
      }
      addAuditLog({
        entityType: 'Invoice',
        entityId: updatedInvoice.id,
        actionType: 'update',
        changeSummary: `Updated invoice details for '${updatedInvoice.id}' (client: ${updatedInvoice.clientName})`
      });

      setInvoices(current => current.map(inv => inv.id === invoiceForm.id ? updatedInvoice : inv));
      syncInvoiceToReceivables(updatedInvoice, 'update');
      alert(`Invoice ${invoiceForm.id} updated successfully.`);
    } else {
      // Create new
      const nextNum = invoices.length + 1;
      const newId = `INV-2026-${nextNum.toString().padStart(3, '0')}`;
      
      let finalStatus: Invoice['status'] = status;
      if (status === 'Sent' && invoiceForm.dueDate < todayStr) {
        finalStatus = 'Overdue';
      }

      const newInvoice: Invoice = {
        id: newId,
        clientName: invoiceForm.clientName,
        clientEmail: invoiceForm.clientEmail,
        companyName: invoiceForm.companyName,
        billingAddress: invoiceForm.billingAddress,
        gstTaxId: invoiceForm.gstTaxId,
        currency: invoiceForm.currency,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        paymentTerms: invoiceForm.paymentTerms,
        items: invoiceForm.items,
        subtotal: invoiceForm.subtotal,
        taxAmount: invoiceForm.taxAmount,
        discount: invoiceForm.discount,
        totalAmount: invoiceForm.totalAmount,
        dueAmount: invoiceForm.totalAmount,
        termsAndConditions: invoiceForm.termsAndConditions,
        internalNotes: invoiceForm.internalNotes,
        customerNotes: invoiceForm.customerNotes,
        status: finalStatus,
        payments: [],
        projectName: invoiceForm.projectName
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('invoices').insert(mapInvoiceToDB(newInvoice));
        if (error) console.error('Error creating invoice in DB:', error);
      }
      addAuditLog({
        entityType: 'Invoice',
        entityId: newInvoice.id,
        actionType: 'create',
        changeSummary: `Created invoice '${newInvoice.id}' (client: ${newInvoice.clientName}, total: ${formatMoney(newInvoice.totalAmount, newInvoice.currency)})`
      });

      setInvoices(current => [...current, newInvoice]);
      syncInvoiceToReceivables(newInvoice, 'create');
      alert(`Invoice ${newId} created successfully.`);
    }
    setInvoiceViewMode('list');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) return;

    const amt = parseFloat(paymentForm.amountReceived as any) || 0;
    const paidAmt = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
    const balance = inv.totalAmount - paidAmt;

    if (amt <= 0) {
      alert('Amount received must be greater than 0.');
      return;
    }
    if (amt > balance) {
      alert(`Amount received cannot exceed the outstanding balance of ${formatMoney(balance, inv.currency)}`);
      return;
    }

    const newPayment: InvoicePayment = {
      paymentDate: paymentForm.paymentDate,
      amountReceived: amt,
      referenceNumber: paymentForm.referenceNumber || `TXN-${Math.floor(Math.random()*90000 + 10000)}`,
      notes: paymentForm.notes
    };

    const updatedPayments = [...inv.payments, newPayment];
    const totalPaid = updatedPayments.reduce((s, p) => s + p.amountReceived, 0);
    const newDue = inv.totalAmount - totalPaid;
    
    let newStatus: 'Paid' | 'Partial' | 'Sent' | 'Overdue' = 'Sent';
    if (newDue === 0) {
      newStatus = 'Paid';
    } else {
      newStatus = 'Partial';
    }

    const updatedInvoice: Invoice = {
      ...inv,
      payments: updatedPayments,
      dueAmount: newDue,
      status: newStatus
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('invoices').update(mapInvoiceToDB(updatedInvoice)).eq('id', selectedInvoiceId);
      if (error) console.error('Error updating invoice payment in DB:', error);
    }
    addAuditLog({
      entityType: 'Invoice',
      entityId: updatedInvoice.id,
      actionType: 'update',
      changeSummary: `Recorded payment of ${formatMoney(amt, updatedInvoice.currency)} on invoice '${updatedInvoice.id}'`
    });

    setInvoices(current => current.map(item => item.id === selectedInvoiceId ? updatedInvoice : item));
    syncInvoiceToReceivables(updatedInvoice, 'update');

    // Reset payment form
    setPaymentForm({
      paymentDate: new Date().toISOString().split('T')[0],
      amountReceived: 0,
      referenceNumber: '',
      notes: ''
    });
    setIsRecordPaymentOpen(false);
    alert('Payment recorded successfully.');
  };

  // Sync AI Tools cost to store
  useEffect(() => {
    const sum = Object.values(activeAiTools)
      .filter(t => t.active)
      .reduce((acc, t) => acc + t.cost, 0);
    updateProjectEstimate({ simAiToolsCost: sum });
  }, [activeAiTools, updateProjectEstimate]);

  // Sync SaaS Tools cost to store
  useEffect(() => {
    const sum = Object.values(activeSaasTools)
      .filter(t => t.active)
      .reduce((acc, t) => acc + t.cost, 0);
    updateProjectEstimate({ simSaasToolsCost: sum });
  }, [activeSaasTools, updateProjectEstimate]);

  // Sync Infra cost to store
  useEffect(() => {
    const sum = Object.values(activeInfra)
      .filter(t => t.active)
      .reduce((acc, t) => acc + t.cost, 0);
    updateProjectEstimate({ simInfraCost: sum });
  }, [activeInfra, updateProjectEstimate]);

  // Sync Other Costs to store
  useEffect(() => {
    const sum = Object.values(activeOtherCosts).reduce((acc, v) => acc + v, 0);
    updateProjectEstimate({ simOtherCosts: sum });
  }, [activeOtherCosts, updateProjectEstimate]);

  // Sub-forms local states
  const [newEmp, setNewEmp] = useState({
    roleName: '',
    department: 'Engineering',
    annualSalary: 800000,
    salaryCurrency: 'INR',
    totalWorkingHoursMonth: 176,
    utilizationPercent: 80,
    allocationFactor: 1.0,
    overheadMultiplier: 1.0,
    meetingsHours: 12,
    operationsHours: 8,
    leaveHours: 8,
    internalSupportHours: 5,
    learningHours: 10
  });

  // State hooks declared at component top-level to satisfy Rules of Hooks
  const [activeConfigTab, setActiveConfigTab] = useState<'workforce' | 'overheads'>('workforce');
  const [revenueForm, setRevenueForm] = useState({
    clientName: '',
    revenueType: 'retainer' as any,
    amount: 50000,
    currency: 'INR',
    frequency: 'monthly' as any,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as any,
    notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    category: 'hosting' as any,
    amount: 10000,
    currency: 'INR',
    frequency: 'monthly' as any,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as any,
    forecastImpact: 'medium' as any
  });
  const [receivableForm, setReceivableForm] = useState({
    client: '',
    invoice: '',
    amount: 50000,
    currency: 'INR',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'unpaid' as any,
    daysOutstanding: 0,
    collectionRisk: 'low' as any
  });
  const [payableForm, setPayableForm] = useState({
    vendor: '',
    expense: '',
    amount: 20000,
    currency: 'INR',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'unpaid' as any,
    priority: 'medium' as any
  });

  const [newInfra, setNewInfra] = useState({
    serviceName: '',
    category: 'AWS',
    monthlyCost: 100,
    costCurrency: 'USD',
    allocationType: 'organization_wide' as any,
    allocationPercent: 100,
    projectDependency: false
  });

  const [newSaas, setNewSaas] = useState({
    toolName: '',
    category: 'Productivity',
    monthlyCost: 10,
    costCurrency: 'USD',
    seats: 5,
    allocationPercent: 100,
    aiDependency: false
  });

  const [newOverhead, setNewOverhead] = useState({
    categoryName: '',
    monthlyCost: 10000,
    costCurrency: 'INR',
    allocationLogic: 'capacity_division'
  });

  const [resAllocationInput, setResAllocationInput] = useState({
    employeeId: '',
    allocatedHours: 80,
    quantity: 1
  });



  // Run initial calculations on mount
  useEffect(() => {
    recompute();
  }, [recompute]);



  // Convert formatting helpers
  const formatMoney = (val: number, currency: string = baseCurrency) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'GBP' ? '£' : (currency === 'AED' ? 'AED ' : '$');
    const formattedVal = val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    
    // Read from userPreferences
    const format = userPreferences?.currencyFormat || 'symbol_prefix';
    if (format === 'symbol_suffix') {
      return `${formattedVal} ${symbol}`;
    } else if (format === 'code_prefix') {
      return `${currency} ${formattedVal}`;
    } else if (format === 'code_suffix') {
      return `${formattedVal} ${currency}`;
    }
    // Default symbol_prefix
    return `${symbol}${formattedVal}`;
  };

  const getDynamicAIInsights = (): { id: string; text: string; type: 'success' | 'warning' | 'risk' | 'primary' }[] => {
    const insights: { id: string; text: string; type: 'success' | 'warning' | 'risk' | 'primary' }[] = [];

    // 1. Overdue Invoices check
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((s, inv) => s + inv.dueAmount, 0);
      insights.push({
        id: 'overdue-invoices',
        text: `${overdueInvoices.length} invoice(s) are currently OVERDUE, totaling ${formatMoney(totalOverdue)}. Consider initiating follow-ups.`,
        type: 'risk'
      });
    }

    // 2. Margin Threshold check
    const lowMarginEstimates = savedEstimates.filter(est => {
      const margin = est.targetMargin;
      const minSafe = marginPolicy?.minimumSafeMargin ?? 25;
      return margin < minSafe;
    });
    if (lowMarginEstimates.length > 0) {
      insights.push({
        id: 'low-margin-estimates',
        text: `Saved estimate '${lowMarginEstimates[0].projectName}' has a target margin of ${lowMarginEstimates[0].targetMargin.toFixed(0)}%, falling below the safe threshold of ${(marginPolicy?.minimumSafeMargin ?? 25).toFixed(0)}%.`,
        type: 'risk'
      });
    }

    // 3. Receivables vs monthly operational burn runway
    const activeSaaS = saasTools.filter(t => t.activeStatus).reduce((s, t) => s + convertCurrency(t.monthlyCost, t.costCurrency, baseCurrency, exchangeRates), 0);
    const activeInfra = infraServices.filter(i => i.activeStatus).reduce((s, i) => s + convertCurrency(i.monthlyCost, i.costCurrency, baseCurrency, exchangeRates), 0);
    const activeOverhead = overheads.reduce((s, o) => s + convertCurrency(o.monthlyCost, o.costCurrency, baseCurrency, exchangeRates), 0);
    
    // Add monthly payroll cost (sum of active employees salary/12)
    const activePayroll = employees.filter(e => e.activeStatus).reduce((s, e) => s + convertCurrency(e.annualSalary / 12, e.salaryCurrency, baseCurrency, exchangeRates), 0);
    
    const totalMonthlyBurn = activeSaaS + activeInfra + activeOverhead + activePayroll;
    const unpaidReceivables = receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);

    if (totalMonthlyBurn > 0 && unpaidReceivables > 0) {
      const monthsRunway = unpaidReceivables / totalMonthlyBurn;
      if (monthsRunway >= 6) {
        insights.push({
          id: 'receivables-runway',
          text: `Outstanding receivables (${formatMoney(unpaidReceivables)}) cover ${monthsRunway.toFixed(1)} months of operational burn (${formatMoney(totalMonthlyBurn)}/mo).`,
          type: 'success'
        });
      } else if (monthsRunway < 2) {
        insights.push({
          id: 'receivables-runway-low',
          text: `Outstanding receivables (${formatMoney(unpaidReceivables)}) cover only ${monthsRunway.toFixed(1)} months of operational burn (${formatMoney(totalMonthlyBurn)}/mo). Cash flow pressure may increase.`,
          type: 'warning'
        });
      }
    }

    // 4. SaaS Cost Breakdown (AI Tools share)
    const activeAiSaaS = saasTools.filter(t => t.aiDependency && t.activeStatus).reduce((s, t) => s + convertCurrency(t.monthlyCost, t.costCurrency, baseCurrency, exchangeRates), 0);
    const totalSaaS = saasTools.filter(t => t.activeStatus).reduce((s, t) => s + convertCurrency(t.monthlyCost, t.costCurrency, baseCurrency, exchangeRates), 0);
    if (totalSaaS > 0 && activeAiSaaS / totalSaaS > 0.3) {
      const aiPercent = (activeAiSaaS / totalSaaS) * 100;
      insights.push({
        id: 'ai-saas-intensity',
        text: `AI SaaS tools represent ${aiPercent.toFixed(0)}% of your active tooling budget, indicating high AI resource intensity.`,
        type: 'primary'
      });
    }

    // 5. Low employee utilization check
    const lowUtilEmployees = employees.filter(e => e.activeStatus && e.utilizationPercent < 75);
    if (lowUtilEmployees.length > 0) {
      insights.push({
        id: 'low-utilization',
        text: `Employee role '${lowUtilEmployees[0].roleName}' runs at low utilization (${lowUtilEmployees[0].utilizationPercent.toFixed(0)}%), which increases effective hourly burn.`,
        type: 'warning'
      });
    }

    // Fallbacks to guarantee 4 cards if list is short
    if (insights.length < 1) {
      insights.push({
        id: 'fb-1',
        text: `All simulated estimates currently meet target profitability thresholds.`,
        type: 'success'
      });
    }
    if (insights.length < 2) {
      insights.push({
        id: 'fb-2',
        text: `Exchange rates are currently aligned. Base operating currency is set to ${baseCurrency}.`,
        type: 'primary'
      });
    }
    if (insights.length < 3) {
      insights.push({
        id: 'fb-3',
        text: `No overdue invoices detected. Cash flow recovery remains healthy.`,
        type: 'success'
      });
    }
    if (insights.length < 4) {
      insights.push({
        id: 'fb-4',
        text: `Workspace metrics represent true delivery costs based on current operational realities.`,
        type: 'primary'
      });
    }

    return insights.slice(0, 4);
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const format = userPreferences?.dateFormat || 'YYYY-MM-DD';
    if (format === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    } else if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    return `${year}-${month}-${day}`;
  };

  const formatMoneyCompact = (val: number, currency: string = baseCurrency) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const symbol = currency === 'INR' ? '₹' : currency === 'GBP' ? '£' : (currency === 'AED' ? 'AED ' : '$');
    
    let formatted = '';
    if (absVal >= 1000000) {
      const num = absVal / 1000000;
      formatted = num.toFixed(2).replace(/\.?0+$/, '') + 'M';
    } else if (absVal >= 1000) {
      formatted = Math.round(absVal / 1000) + 'k';
    } else {
      formatted = absVal.toString();
    }
    
    const sign = isNegative ? '-' : (val > 0 ? '+' : '');
    return `${sign}${symbol}${formatted}`;
  };






  // Recharts Data Prep

    // ----------------------------------------------------
  // CASH FLOW CALENDAR HELPER FUNCTIONS
  // ----------------------------------------------------
  
  const getCalendarEvents = (yearMonth: string) => {
    const events: any[] = [];
    
    // 1. One-time Receivables
    receivables.forEach((r: any) => {
      if (r.dueDate.startsWith(yearMonth)) {
        events.push({
          id: r.id,
          type: 'receivable_one_time',
          title: r.client,
          amount: r.amount,
          date: r.dueDate,
          status: r.status,
          category: 'project',
          clientVendor: r.client,
          notes: r.invoice || '',
          color: '#10b981'
        });
      }
    });
    
    // 2. One-time Payables
    payables.forEach((p: any) => {
      if (p.dueDate.startsWith(yearMonth)) {
        events.push({
          id: p.id,
          type: 'payable_one_time',
          title: p.expense || p.vendor,
          amount: p.amount,
          date: p.dueDate,
          status: p.status,
          category: 'operations',
          clientVendor: p.vendor,
          notes: p.expense || '',
          color: '#ef4444'
        });
      }
    });
    
    // 3. Recurring Revenues
    recurringRevenues.forEach((r: any) => {
      if (r.status === 'active' && yearMonth >= r.startDate.substring(0, 7) && (!r.endDate || yearMonth <= r.endDate.substring(0, 7))) {
        const dueDay = new Date(r.startDate).getDate();
        const dateStr = `${yearMonth}-${dueDay.toString().padStart(2, '0')}`;
        events.push({
          id: r.id,
          type: 'receivable_recurring',
          title: r.clientName,
          amount: r.amount,
          date: dateStr,
          status: 'active',
          category: r.revenueType,
          clientVendor: r.clientName,
          notes: r.notes || '',
          color: '#3b82f6'
        });
      }
    });
    
    // 4. Recurring Expenses
    recurringExpenses.forEach((e: any) => {
      if (e.status === 'active' && yearMonth >= e.startDate.substring(0, 7) && (!e.endDate || yearMonth <= e.endDate.substring(0, 7))) {
        const dueDay = new Date(e.startDate).getDate();
        const dateStr = `${yearMonth}-${dueDay.toString().padStart(2, '0')}`;
        events.push({
          id: e.id,
          type: 'payable_recurring',
          title: e.expenseName,
          amount: e.amount,
          date: dateStr,
          status: 'active',
          category: e.category,
          clientVendor: e.expenseName,
          notes: '',
          color: '#f97316'
        });
      }
    });
    
    return events;
  };


  const rawEvents = getCalendarEvents(currentMonth);
  
  const filteredEvents = rawEvents.filter((ev: any) => {
    if (calSearchQuery) {
      const q = calSearchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchAmount = ev.amount.toString().includes(q);
      const matchClient = ev.clientVendor.toLowerCase().includes(q);
      if (!matchTitle && !matchAmount && !matchClient) return false;
    }
    
    if (calTypeFilter !== 'all') {
      if (calTypeFilter === 'receivable_one_time' && ev.type !== 'receivable_one_time') return false;
      if (calTypeFilter === 'receivable_recurring' && ev.type !== 'receivable_recurring') return false;
      if (calTypeFilter === 'payable_one_time' && ev.type !== 'payable_one_time') return false;
      if (calTypeFilter === 'payable_recurring' && ev.type !== 'payable_recurring') return false;
      if (calTypeFilter === 'receivables' && !ev.type.startsWith('receivable')) return false;
      if (calTypeFilter === 'payables' && !ev.type.startsWith('payable')) return false;
    }
    
    if (calStatusFilter !== 'all') {
      if (calStatusFilter === 'pending' && ev.status !== 'unpaid' && ev.status !== 'pending') return false;
      if (calStatusFilter === 'collected' && ev.status !== 'paid' && ev.status !== 'collected') return false;
      if (calStatusFilter === 'overdue' && ev.status !== 'overdue') return false;
      if (calStatusFilter === 'cancelled' && ev.status !== 'cancelled') return false;
    }
    
    if (calCategoryFilter !== 'all') {
      if (ev.category.toLowerCase() !== calCategoryFilter.toLowerCase()) return false;
    }
    
    if (calClientFilter !== 'all') {
      if (ev.clientVendor.toLowerCase() !== calClientFilter.toLowerCase()) return false;
    }
    
    if (calAmountRange !== 'all') {
      if (calAmountRange === 'under_10k' && ev.amount >= 10000) return false;
      if (calAmountRange === '10k_100k' && (ev.amount < 10000 || ev.amount > 100000)) return false;
      if (calAmountRange === 'over_100k' && ev.amount <= 100000) return false;
    }
    
    if (calRegionFilter !== 'all') {
      const clientRegions: Record<string, string> = {
        'acme corp': 'US',
        'nova systems': 'India',
        'globex ltd': 'US',
        'cyberdyne corp': 'US'
      };
      const clientNameLower = ev.clientVendor.toLowerCase();
      const region = clientRegions[clientNameLower] || 'US';
      if (region.toLowerCase() !== calRegionFilter.toLowerCase()) return false;
    }
    
    return true;
  });

  const calendarYear = parseInt(currentMonth.split('-')[0]);
  const calendarMonth = parseInt(currentMonth.split('-')[1]) - 1;
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
  const startDayOfWeek = userPreferences?.startWeekOn === 'Monday'
    ? (firstDayOfMonth.getDay() + 6) % 7
    : firstDayOfMonth.getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
  
  const cells = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = calendarMonth === 0 ? 11 : calendarMonth - 1;
    const y = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    cells.push({ day, isCurrentMonth: false, dateStr, label: day.toString() });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    cells.push({ day, isCurrentMonth: true, dateStr, label: day.toString() });
  }
  const totalCells = cells.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const m = calendarMonth === 11 ? 0 : calendarMonth + 1;
    const y = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const label = day === 1 ? `1 ${new Date(y, m, 1).toLocaleString('en-US', { month: 'short' })}` : day.toString();
    cells.push({ day, isCurrentMonth: false, dateStr, label });
  }
  
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  
  const monthInflow = filteredEvents.filter((ev: any) => ev.type.startsWith('receivable') && ev.status !== 'cancelled').reduce((sum: number, ev: any) => sum + ev.amount, 0);
  const monthOutflow = filteredEvents.filter((ev: any) => ev.type.startsWith('payable') && ev.status !== 'cancelled').reduce((sum: number, ev: any) => sum + ev.amount, 0);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at bottom, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(79, 124, 255, 0.15)',
          borderTop: '4px solid #4F7CFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>Initializing Secure Session</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>Please wait while we connect to PIOS Engine...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!session && !bypassAuth) {
    return (
      <AuthScreen 
        onAuthSuccess={(newSession) => setSession(newSession)}
        onBypass={() => setBypassAuth(true)}
      />
    );
  }

return (
    <div className={`app-container ${userPreferences?.theme === 'dark' ? 'dark' : ''}`}>
      {/* Global SVG Defs for striped bars and gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <pattern id="diagonal-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#FFFFFF" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#E2E8F0" strokeWidth="1.5" />
          </pattern>
          <linearGradient id="active-blue-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <linearGradient id="active-orange-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <linearGradient id="active-green-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
          <linearGradient id="active-indigo-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
          <linearGradient id="active-red-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#FCA5A5" />
          </linearGradient>
          <linearGradient id="active-teal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#99F6E4" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. STICKY LEFT SIDEBAR (Salezzy Style) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="sidebar-logo" style={{ 
            padding: isCollapsed ? '0 8px' : '0 16px 0 24px', 
            justifyContent: isCollapsed ? 'center' : 'space-between', 
            display: 'flex', 
            alignItems: 'center',
            flexDirection: isCollapsed ? 'column' : 'row',
            gap: isCollapsed ? '8px' : '12px',
            marginBottom: isCollapsed ? '20px' : '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {companyProfile.companyLogo ? (
                <img
                  src={companyProfile.companyLogo}
                  alt={companyProfile.companyName || "Company Logo"}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)'
                  }}
                  title={companyProfile.companyName || "Salezy"}
                />
              ) : (
                <div className="sidebar-logo-icon" title="Salezy">
                  <TrendingUp size={18} />
                </div>
              )}
              {!isCollapsed && <span className="sidebar-logo-text">{companyProfile.companyName || "Salezy"}</span>}
            </div>
            <button
              onClick={handleToggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                marginLeft: isCollapsed ? '0' : 'auto'
              }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <nav className="sidebar-nav">
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 16px', marginBottom: '8px', display: 'block' }}>
              Main Menu
            </span>
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              data-tooltip="Dashboard"
            >
              <TrendingUp size={18} />
              <span>Dashboard</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              <button
                className={`nav-item ${['calendar', 'revenue', 'expenses', 'receivables', 'payables', 'invoices', 'customers'].includes(activeTab) ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('calendar');
                  if (!isCollapsed) {
                    setFinancialHubExpanded(!financialHubExpanded);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none', cursor: 'pointer' }}
                data-tooltip="Financial Hub"
              >
                <Network size={18} style={{ color: ['calendar', 'revenue', 'expenses', 'receivables', 'payables', 'invoices', 'customers'].includes(activeTab) ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                <span style={{ marginLeft: '10px' }}>Financial Hub</span>
                {!isCollapsed && (
                  financialHubExpanded ? (
                    <ChevronUp size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronDown size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  )
                )}
              </button>
              {((!isCollapsed && financialHubExpanded) || isCollapsed) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', transition: 'all 0.2s ease' }}>
                  <button
                    className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('revenue')}
                    data-tooltip="Revenue"
                  >
                    <DollarSign size={16} />
                    <span>Revenue</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('expenses')}
                    data-tooltip="Expenses"
                  >
                    <TrendingDown size={16} />
                    <span>Expenses</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'receivables' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('receivables')}
                    data-tooltip="Receivables"
                  >
                    <Users size={16} />
                    <span>Receivables</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'payables' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('payables')}
                    data-tooltip="Payables"
                  >
                    <Server size={16} />
                    <span>Payables</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('invoices')}
                    data-tooltip="Invoices"
                  >
                    <FileText size={16} />
                    <span>Invoices</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                    style={{ paddingLeft: isCollapsed ? '0' : '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={() => setActiveTab('customers')}
                    data-tooltip="Customers"
                  >
                    <Users size={16} />
                    <span>Customers</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 16px', marginBottom: '4px', display: 'block' }}>
                Tools
              </span>
              <button
                className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulator')}
                data-tooltip="Estimate Simulator"
              >
                <Briefcase size={18} />
                <span>Estimate Simulator</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
                onClick={() => setActiveTab('archive')}
                data-tooltip="Estimate History"
              >
                <History size={18} />
                <span>Estimate History</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
                data-tooltip="Financial Settings"
              >
                <Key size={18} />
                <span>Financial Settings</span>
              </button>
            </div>
          </nav>
        </div>
 
        <div className="sidebar-footer">

          {/* Base Currency Card */}
          <div className="card-premium" style={{ padding: '12px 14px', marginBottom: '12px', backgroundColor: 'var(--bg-input)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Operating Base
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <PremiumSelect
                className="input-premium"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
              </PremiumSelect>
              <button
                className="circle-btn"
                style={{ backgroundColor: 'var(--bg-card)', width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}
                onClick={recompute}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
 

        </div>
      </aside>

      {/* 2. MAIN WORKING DASHBOARD */}
      <main className={`main-workspace ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top AppBar */}
        <header className="header-bar" style={activeTab === 'calendar' ? { padding: '8px 24px', height: 'auto', minHeight: '56px' } : undefined}>
          {activeTab === 'calendar' ? (
            <>
              {/* Consolidated Filter Controls Row (Title & Search removed to optimize space) */}
              <div style={{ display: 'flex', gap: '8px 12px', alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 auto', width: '100%' }}>
                {/* Date Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '105px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Date Range</span>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Calendar size={12} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)', zIndex: 1 }} />
                    <PremiumSelect
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(e.target.value)}
                      className="input-premium"
                      style={{ padding: '3px 6px 3px 22px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                    >
                      <option value="2026-05">May 2026</option>
                      <option value="2026-06">Jun 2026</option>
                      <option value="2026-07">Jul 2026</option>
                      <option value="2026-08">Aug 2026</option>
                    </PremiumSelect>
                  </div>
                </div>

                {/* Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '75px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Type</span>
                  <PremiumSelect
                    value={calTypeFilter}
                    onChange={(e) => setCalTypeFilter(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="receivables">Receivables</option>
                    <option value="payables">Payables</option>
                    <option value="receivable_one_time">Receivable (One-time)</option>
                    <option value="receivable_recurring">Receivable (Recurring)</option>
                    <option value="payable_one_time">Payable (One-time)</option>
                    <option value="payable_recurring">Payable (Recurring)</option>
                  </PremiumSelect>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '75px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Status</span>
                  <PremiumSelect
                    value={calStatusFilter}
                    onChange={(e) => setCalStatusFilter(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="collected">Collected / Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </PremiumSelect>
                </div>

                {/* Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '85px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Category</span>
                  <PremiumSelect
                    value={calCategoryFilter}
                    onChange={(e) => setCalCategoryFilter(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="amc">AMC</option>
                    <option value="retainer">Retainer</option>
                    <option value="dedicated_resource">Dedicated Team</option>
                    <option value="project">Project</option>
                    <option value="payroll">Payroll</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="ai_tools">AI Tools</option>
                    <option value="operations">Operations</option>
                    <option value="software_licenses">Software</option>
                    <option value="compliance">Compliance</option>
                  </PremiumSelect>
                </div>

                {/* Client / Vendor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '95px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Client / Vendor</span>
                  <PremiumSelect
                    value={calClientFilter}
                    onChange={(e) => setCalClientFilter(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="acme corp">Acme Corp</option>
                    <option value="nova systems">Nova Systems</option>
                    <option value="globex ltd">Globex Ltd</option>
                    <option value="cyberdyne corp">Cyberdyne Corp</option>
                    <option value="figma">Figma</option>
                    <option value="office landlord">Office Rent</option>
                    <option value="payroll provider">Payroll</option>
                  </PremiumSelect>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '75px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Amount</span>
                  <PremiumSelect
                    value={calAmountRange}
                    onChange={(e) => setCalAmountRange(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="under_10k">Under ₹10k</option>
                    <option value="10k_100k">₹10k - ₹100k</option>
                    <option value="over_100k">Over ₹100k</option>
                  </PremiumSelect>
                </div>

                {/* Region */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 auto', minWidth: '75px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '2px' }}>Region</span>
                  <PremiumSelect
                    value={calRegionFilter}
                    onChange={(e) => setCalRegionFilter(e.target.value)}
                    className="input-premium"
                    style={{ padding: '3px 6px', fontSize: '0.72rem', width: '100%', height: '26px', borderRadius: '6px' }}
                  >
                    <option value="all">All</option>
                    <option value="us">US</option>
                    <option value="uk">UK</option>
                    <option value="uae">UAE</option>
                    <option value="india">India</option>
                  </PremiumSelect>
                </div>

                {/* Actions container: Clear Filters + Export */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center', 
                  marginLeft: 'auto', 
                  flexShrink: 0,
                  alignSelf: 'flex-end', 
                  height: '26px',
                  marginTop: 'auto'
                }}>
                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setCalTypeFilter('all');
                      setCalStatusFilter('all');
                      setCalCategoryFilter('all');
                      setCalClientFilter('all');
                      setCalAmountRange('all');
                      setCalRegionFilter('all');
                      setCalSearchQuery('');
                    }}
                    style={{
                      padding: '3px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Clear Filters
                  </button>

                  {/* Export Button */}
                  <button
                    className="btn-pill btn-pill-primary"
                    onClick={() => alert('Exporting Cash Flow Calendar data...')}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      color: '#ffffff',
                      backgroundColor: 'var(--color-primary)',
                      cursor: 'pointer',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={11} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Left Zone: Title */}
              <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', minWidth: 0 }}>
                {activeTab !== 'revenue' && activeTab !== 'expenses' && activeTab !== 'receivables' && activeTab !== 'payables' && activeTab !== 'archive' && activeTab !== 'settings' && activeTab !== 'invoices' && (
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap' }}>
                    {activeTab === 'dashboard' && 'Overview'}
                    {activeTab === 'simulator' && 'Simulation Cockpit'}
                  </h2>
                )}
              </div>

              {/* Center Zone: Universal Search centered */}
              <div style={{ display: 'flex', justifyContent: 'center', flex: '1 1 0%' }}>
                <div className="header-search" style={{ width: '100%', maxWidth: '380px' }}>
                  <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                  <input placeholder="Search clients, estimates, expenses, invoices..." type="text" readOnly />
                </div>
              </div>

              {/* Right Zone: Actions */}
              <div className="header-actions" style={{ flex: '1 1 0%', justifyContent: 'flex-end' }}>
                {activeTab !== 'dashboard' && activeTab !== 'simulator' && activeTab !== 'revenue' && activeTab !== 'expenses' && activeTab !== 'receivables' && activeTab !== 'payables' && activeTab !== 'archive' && activeTab !== 'settings' && activeTab !== 'invoices' && activeTab !== 'customers' && (
                  <>
                    {/* Date Filter */}
                    <PremiumSelect
                      className="input-premium"
                      style={{
                        width: 'auto',
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-medium)',
                        cursor: 'pointer'
                      }}
                      defaultValue="This Month"
                    >
                      <option value="This Month">This Month</option>
                      <option value="Next Month">Next Month</option>
                      <option value="Quarter">Quarter</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="Custom">Custom</option>
                    </PremiumSelect>

                    {/* Export Button */}
                    <button
                      className="btn-pill btn-pill-secondary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '38px',
                        boxShadow: 'none'
                      }}
                      onClick={() => alert('Exporting view...')}
                    >
                      <Upload size={14} style={{ transform: 'rotate(180deg)' }} />
                      <span>Export</span>
                    </button>

                    <div className="header-divider"></div>
                  </>
                )}

                <button className="circle-btn" style={{ position: 'relative' }}>
                  <Bell size={20} />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--color-risk)', borderRadius: '50%' }}></span>
                </button>
                <div className="profile-avatar-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <img
                    alt="User Profile"
                    className="profile-img"
                    src={userProfile.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuAj2ifRKYHpPPjM6gK7A2TSv_EkoDUC2J0i-P09jQ0-9c11ONaTn8EYEt-eYm_-4hPHyJaiaA4qC4cquwSx0tnP6Tjqg69_nAK3uHZwm7Ju4fNljfdg3Kk-e6B4N-m7HkIFCf2TerlZmXPlkyQaeSbYA_r3Yu94oxBMmoCtqvjQTlFVsfsrUXtq76ecvMvFgtfGTCSAO_i59P_H6BILgHz_bpviVKQXwoEyjap99rhEZDXgrMAAm7Hn1EEWDXntVy2NUjrG0AiQLfYm"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    }}
                  />
                  
                  {isProfileDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 10px)',
                        width: '280px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-floating)',
                        zIndex: 1000,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Dropdown Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={userProfile.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuAj2ifRKYHpPPjM6gK7A2TSv_EkoDUC2J0i-P09jQ0-9c11ONaTn8EYEt-eYm_-4hPHyJaiaA4qC4cquwSx0tnP6Tjqg69_nAK3uHZwm7Ju4fNljfdg3Kk-e6B4N-m7HkIFCf2TerlZmXPlkyQaeSbYA_r3Yu94oxBMmoCtqvjQTlFVsfsrUXtq76ecvMvFgtfGTCSAO_i59P_H6BILgHz_bpviVKQXwoEyjap99rhEZDXgrMAAm7Hn1EEWDXntVy2NUjrG0AiQLfYm"}
                          alt={userProfile.fullName}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userProfile.fullName || "Dhanooj B S"}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userProfile.designation || "Administrator"} • {companyProfile.companyName || "Moonhive"}
                          </span>
                        </div>
                      </div>

                      <div style={{ height: '1px', backgroundColor: 'var(--border-medium)', margin: '4px 0' }} />

                      {/* Dropdown Menu Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            setActiveModal('profile');
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </button>
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            setActiveModal('company');
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <Building size={16} />
                          <span>Company Profile</span>
                        </button>
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            setActiveModal('preferences');
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <Sliders size={16} />
                          <span>Preferences</span>
                        </button>
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            setActiveModal('help');
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <HelpCircle size={16} />
                          <span>Help & Support</span>
                        </button>
                        <button
                          className="profile-menu-item danger"
                          onClick={() => {
                            setIsSignOutConfirmOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </header>

        {/* Workspace Content */}
        <div className="workspace-content">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Greeting & Action Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                {/* Left: Dynamic Greeting & Date */}
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
                    {getGreeting()}, {userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Dhanooj'}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 500 }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Right: Relocated Filters & Export */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PremiumSelect
                    className="input-premium"
                    style={{
                      width: 'auto',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-medium)',
                      cursor: 'pointer',
                      height: '32px'
                    }}
                    defaultValue="This Month"
                  >
                    <option value="This Month">This Month</option>
                    <option value="Next Month">Next Month</option>
                    <option value="Quarter">Quarter</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="Custom">Custom</option>
                  </PremiumSelect>

                  <button
                    className="btn-pill btn-pill-secondary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      boxShadow: 'none',
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-medium)'
                    }}
                    onClick={() => alert('Exporting view...')}
                  >
                    <Upload size={13} style={{ transform: 'rotate(180deg)' }} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Top KPI Section (4 Cards for above-the-fold visibility, styled exactly like reference) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {/* KPI 1: Revenue */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', padding: '12px 18px', height: '106px', boxSizing: 'border-box' }}>
                  {/* Row 1: Icon + Title on left, Info on right */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DollarSign size={14} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Revenue</span>
                    </div>
                    <Info size={14} style={{ color: '#9CA3AF', cursor: 'pointer' }} />
                  </div>
                  {/* Row 2: Value */}
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {formatMoney(metrics.totalRecurringRevenueMonth)}
                  </h3>
                  {/* Row 3: Trend Badge + Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success-text)', padding: '2px 8px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center' }}>
                      ↑ 14%
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>from last month</span>
                  </div>
                </div>

                {/* KPI 2: Expenses */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', padding: '12px 18px', height: '106px', boxSizing: 'border-box' }}>
                  {/* Row 1: Icon + Title on left, Info on right */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(251, 146, 60, 0.08)', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TrendingDown size={14} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expenses</span>
                    </div>
                    <Info size={14} style={{ color: '#9CA3AF', cursor: 'pointer' }} />
                  </div>
                  {/* Row 2: Value */}
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {formatMoney(metrics.totalRecurringExpenseMonth)}
                  </h3>
                  {/* Row 3: Trend Badge + Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success-text)', padding: '2px 8px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center' }}>
                      ↓ 2%
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>from last month</span>
                  </div>
                </div>

                {/* KPI 3: Profit */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', padding: '12px 18px', height: '106px', boxSizing: 'border-box' }}>
                  {/* Row 1: Icon + Title on left, Info on right */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TrendingUp size={14} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Profit</span>
                    </div>
                    <Info size={14} style={{ color: '#9CA3AF', cursor: 'pointer' }} />
                  </div>
                  {/* Row 2: Value */}
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {formatMoney(metrics.totalRecurringRevenueMonth - metrics.totalRecurringExpenseMonth)}
                  </h3>
                  {/* Row 3: Trend Badge + Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success-text)', padding: '2px 8px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center' }}>
                      ↑ {metrics.totalRecurringRevenueMonth > 0 ? ((metrics.totalRecurringRevenueMonth - metrics.totalRecurringExpenseMonth) / metrics.totalRecurringRevenueMonth * 100).toFixed(0) : '0'}%
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>Margin</span>
                  </div>
                </div>

                {/* KPI 4: Receivables */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', padding: '12px 18px', height: '106px', boxSizing: 'border-box' }}>
                  {/* Row 1: Icon + Title on left, Info on right */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(79, 124, 255, 0.08)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={14} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Receivables</span>
                    </div>
                    <Info size={14} style={{ color: '#9CA3AF', cursor: 'pointer' }} />
                  </div>
                  {/* Row 2: Value */}
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {formatMoney(metrics.totalOutstandingReceivables)}
                  </h3>
                  {/* Row 3: Trend Badge + Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center' }}>
                      Pending
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>invoices</span>
                  </div>
                </div>
              </div>

              {/* Main Graph & Right Arc Gauge */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '16px' }}>
                {/* Forecast Chart */}
                {(() => {
                  const ENABLE_STORYTELLING = true; // Toggle to false to immediately revert

                  const revVal = metrics.totalRecurringRevenueMonth;
                  const expVal = metrics.totalRecurringExpenseMonth;
                  const profitVal = revVal - expVal;
                  const recVal = metrics.totalOutstandingReceivables;
                  const payVal = metrics.totalOutstandingPayables;
                  const cashVal = monthInflow - monthOutflow;

                  const insightViews = [
                    {
                      id: 'revenue',
                      title: 'Revenue Insights',
                      value: revVal,
                      changeText: '+4.0%',
                      changeType: 'up',
                      color: '#4F7CFF',
                      gradientId: 'active-blue-grad',
                      dataKey: 'revenue',
                      legend: [
                        { label: 'Earning', color: '#4F7CFF' },
                        { label: 'Sales', color: '#06B6D4' },
                        { label: 'Refunds', color: '#94A3B8' }
                      ]
                    },
                    {
                      id: 'expenses',
                      title: 'Expense Insights',
                      value: expVal,
                      changeText: '-2.0%',
                      changeType: 'down',
                      color: '#FB923C',
                      gradientId: 'active-orange-grad',
                      dataKey: 'expenses',
                      legend: [
                        { label: 'Fixed Spend', color: '#FB923C' },
                        { label: 'SaaS Costs', color: '#818CF8' },
                        { label: 'Variable', color: '#94A3B8' }
                      ]
                    },
                    {
                      id: 'profit',
                      title: 'Profit Insights',
                      value: profitVal,
                      changeText: '+67%',
                      changeType: 'up',
                      color: '#10B981',
                      gradientId: 'active-green-grad',
                      dataKey: 'profit',
                      legend: [
                        { label: 'Net Profit', color: '#10B981' },
                        { label: 'Margin', color: '#34D399' },
                        { label: 'Buffer', color: '#94A3B8' }
                      ]
                    },
                    {
                      id: 'receivables',
                      title: 'Receivable Insights',
                      value: recVal,
                      changeText: '+12%',
                      changeType: 'up',
                      color: '#6366F1',
                      gradientId: 'active-indigo-grad',
                      dataKey: 'receivables',
                      legend: [
                        { label: 'Current', color: '#6366F1' },
                        { label: 'Overdue', color: '#F87171' },
                        { label: 'Invoiced', color: '#94A3B8' }
                      ]
                    },
                    {
                      id: 'payables',
                      title: 'Payable Insights',
                      value: payVal,
                      changeText: '-5%',
                      changeType: 'down',
                      color: '#EF4444',
                      gradientId: 'active-red-grad',
                      dataKey: 'payables',
                      legend: [
                        { label: 'Vendors', color: '#EF4444' },
                        { label: 'SaaS Bills', color: '#F59E0B' },
                        { label: 'Provisions', color: '#94A3B8' }
                      ]
                    },
                    {
                      id: 'cashflow',
                      title: 'Cash Flow Insights',
                      value: cashVal,
                      changeText: '+8%',
                      changeType: 'up',
                      color: '#14B8A6',
                      gradientId: 'active-teal-grad',
                      dataKey: 'cashflow',
                      legend: [
                        { label: 'Inflow', color: '#14B8A6' },
                        { label: 'Outflow', color: '#F43F5E' },
                        { label: 'Reserves', color: '#94A3B8' }
                      ]
                    }
                  ];

                  if (ENABLE_STORYTELLING) {
                    const currentView = insightViews[activeInsightIndex];

                    const forecastData = [
                      { name: 'Jan', revenue: Math.round(revVal * 0.65), expenses: Math.round(expVal * 0.90), profit: Math.round(profitVal * 0.53), receivables: Math.round(recVal * 0.70), payables: Math.round(payVal * 0.85), cashflow: Math.round(cashVal * 0.60) },
                      { name: 'Feb', revenue: Math.round(revVal * 0.70), expenses: Math.round(expVal * 0.88), profit: Math.round(profitVal * 0.61), receivables: Math.round(recVal * 0.75), payables: Math.round(payVal * 0.90), cashflow: Math.round(cashVal * 0.65) },
                      { name: 'Mar', revenue: Math.round(revVal * 0.78), expenses: Math.round(expVal * 0.92), profit: Math.round(profitVal * 0.71), receivables: Math.round(recVal * 0.80), payables: Math.round(payVal * 0.95), cashflow: Math.round(cashVal * 0.70) },
                      { name: 'Apr', revenue: Math.round(revVal * 0.82), expenses: Math.round(expVal * 0.95), profit: Math.round(profitVal * 0.76), receivables: Math.round(recVal * 0.85), payables: Math.round(payVal * 1.00), cashflow: Math.round(cashVal * 0.75) },
                      { name: 'May', revenue: Math.round(revVal * 0.88), expenses: Math.round(expVal * 1.00), profit: Math.round(profitVal * 0.82), receivables: Math.round(recVal * 0.90), payables: Math.round(payVal * 1.05), cashflow: Math.round(cashVal * 0.80) },
                      { name: 'Jun', revenue: Math.round(revVal * 0.95), expenses: Math.round(expVal * 1.05), profit: Math.round(profitVal * 0.90), receivables: Math.round(recVal * 0.95), payables: Math.round(payVal * 1.10), cashflow: Math.round(cashVal * 0.85) },
                      { name: 'Jul', revenue: Math.round(revVal * 1.05), expenses: Math.round(expVal * 1.10), profit: Math.round(profitVal * 1.02), receivables: Math.round(recVal * 1.05), payables: Math.round(payVal * 1.15), cashflow: Math.round(cashVal * 1.05) },
                      { name: 'Aug', revenue: Math.round(revVal * 0.92), expenses: Math.round(expVal * 0.98), profit: Math.round(profitVal * 0.89), receivables: Math.round(recVal * 0.90), payables: Math.round(payVal * 1.00), cashflow: Math.round(cashVal * 0.88) },
                      { name: 'Sep', revenue: Math.round(revVal * 0.85), expenses: Math.round(expVal * 0.95), profit: Math.round(profitVal * 0.80), receivables: Math.round(recVal * 0.80), payables: Math.round(payVal * 0.92), cashflow: Math.round(cashVal * 0.80) },
                      { name: 'Oct', revenue: Math.round(revVal * 0.96), expenses: Math.round(expVal * 0.92), profit: Math.round(profitVal * 0.98), receivables: Math.round(recVal * 0.95), payables: Math.round(payVal * 0.88), cashflow: Math.round(cashVal * 0.98) },
                      { name: 'Nov', revenue: Math.round(revVal * 0.90), expenses: Math.round(expVal * 0.90), profit: Math.round(profitVal * 0.90), receivables: Math.round(recVal * 0.85), payables: Math.round(payVal * 0.85), cashflow: Math.round(cashVal * 0.90) },
                      { name: 'Dec', revenue: Math.round(revVal * 1.00), expenses: Math.round(expVal * 0.88), profit: Math.round(profitVal * 1.06), receivables: Math.round(recVal * 1.00), payables: Math.round(payVal * 0.80), cashflow: Math.round(cashVal * 1.00) }
                    ];

                    const CustomBarShape = (props: any) => {
                      const { x, y, width, height, index, value } = props;
                      const isActive = index === 6; // Highlight July
                      const rx = width / 2;
                      
                      if (isActive) {
                        const labelText = formatCompactMoney(value);
                        return (
                          <g>
                            <rect x={x} y={y} width={width} height={height} rx={rx} ry={rx} fill={`url(#${currentView.gradientId})`} />
                            <g transform={`translate(${x + width/2}, ${y - 12})`}>
                              <rect x="-28" y="-12" width="56" height="18" rx="9" fill={currentView.color} />
                              <polygon points="0,9 -3,6 3,6" fill={currentView.color} />
                              <text x="0" y="-1" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
                                {labelText}
                              </text>
                            </g>
                          </g>
                        );
                      }
                      return (
                        <rect x={x} y={y} width={width} height={height} rx={rx} ry={rx} fill="url(#diagonal-stripes)" stroke="var(--border-medium)" strokeWidth="1.2" />
                      );
                    };

                    return (
                      <div 
                        className="card-premium" 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px', 
                          padding: '12px 18px', 
                          height: '285px', 
                          boxSizing: 'border-box'
                        }}
                        onMouseEnter={() => {
                          setIsMouseOverChart(true);
                          setIsAutoRotating(false);
                        }}
                        onMouseLeave={() => {
                          setIsMouseOverChart(false);
                          setLastChartInteractionTime(Date.now());
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', transition: 'opacity 0.15s ease', opacity: isChartTransitioning ? 0.7 : 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{currentView.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                {formatMoney(currentView.value)}
                              </h2>
                              <span 
                                className={`pill-badge ${currentView.changeType === 'up' ? 'pill-badge-success' : 'pill-badge-risk'}`} 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}
                              >
                                {currentView.changeType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                <span>{currentView.changeText}</span>
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
                              <span style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '18px', color: 'var(--text-secondary)' }}>Monthly</span>
                              <span style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '18px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)' }}>Yearly</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.68rem', fontWeight: 600, transition: 'opacity 0.15s ease', opacity: isChartTransitioning ? 0.7 : 1 }}>
                              {currentView.legend.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '178px', transition: 'opacity 0.15s ease', opacity: isChartTransitioning ? 0.8 : 1 }}>
                          <ResponsiveContainer width="100%" height={158} minWidth={0} minHeight={0}>
                            <BarChart data={forecastData} margin={{ top: 24, right: 10, left: -15, bottom: 4 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, dy: 6 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 500, dx: -4 }} tickFormatter={(v: any) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                              <ChartTooltip formatter={(v: any) => [formatMoney(Number(v)), '']} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-soft)' }} />
                              <Bar dataKey={currentView.dataKey} shape={<CustomBarShape />} barSize={22} name={currentView.title} />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px', height: '12px', alignItems: 'center' }}>
                            {insightViews.map((view, idx) => {
                              const isActive = idx === activeInsightIndex;
                              return (
                                <button
                                  key={view.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAutoRotating(false);
                                    setLastChartInteractionTime(Date.now());
                                    
                                    setIsChartTransitioning(true);
                                    setTimeout(() => {
                                      setActiveInsightIndex(idx);
                                      setTimeout(() => {
                                        setIsChartTransitioning(false);
                                      }, 150);
                                    }, 150);
                                  }}
                                  aria-label={`Show ${view.title}`}
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    padding: 0,
                                    backgroundColor: isActive ? view.color : 'var(--border-medium)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: isActive ? 'scale(1.25)' : 'scale(1)',
                                    opacity: isActive ? 1 : 0.6
                                  }}
                                  title={view.title}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Original static card rendering
                    const forecastDataOriginal = [
                      { name: 'Jan', Revenue: Math.round(revVal * 0.65) },
                      { name: 'Feb', Revenue: Math.round(revVal * 0.70) },
                      { name: 'Mar', Revenue: Math.round(revVal * 0.78) },
                      { name: 'Apr', Revenue: Math.round(revVal * 0.82) },
                      { name: 'May', Revenue: Math.round(revVal * 0.88) },
                      { name: 'Jun', Revenue: Math.round(revVal * 0.95) },
                      { name: 'Jul', Revenue: Math.round(revVal * 1.05) },
                      { name: 'Aug', Revenue: Math.round(revVal * 0.92) },
                      { name: 'Sep', Revenue: Math.round(revVal * 0.85) },
                      { name: 'Oct', Revenue: Math.round(revVal * 0.96) },
                      { name: 'Nov', Revenue: Math.round(revVal * 0.90) },
                      { name: 'Dec', Revenue: Math.round(revVal * 1.00) }
                    ];

                    const CustomBarShapeOriginal = (props: any) => {
                      const { x, y, width, height, index, value } = props;
                      const isActive = index === 6;
                      const rx = width / 2;
                      if (isActive) {
                        const labelText = formatCompactMoney(value);
                        return (
                          <g>
                            <rect x={x} y={y} width={width} height={height} rx={rx} ry={rx} fill="url(#active-blue-grad)" />
                            <g transform={`translate(${x + width/2}, ${y - 12})`}>
                              <rect x="-28" y="-12" width="56" height="18" rx="9" fill="#4F7CFF" />
                              <polygon points="0,9 -3,6 3,6" fill="#4F7CFF" />
                              <text x="0" y="-1" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
                                {labelText}
                              </text>
                            </g>
                          </g>
                        );
                      }
                      return (
                        <rect x={x} y={y} width={width} height={height} rx={rx} ry={rx} fill="url(#diagonal-stripes)" stroke="var(--border-medium)" strokeWidth="1.2" />
                      );
                    };

                    return (
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 18px', height: '285px', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Revenue Insights</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                {formatMoney(revVal)}
                              </h2>
                              <span className="pill-badge pill-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                                <TrendingUp size={10} />
                                <span>+4.0%</span>
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
                              <span style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '18px', color: 'var(--text-secondary)' }}>Monthly</span>
                              <span style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '18px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)' }}>Yearly</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.68rem', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F7CFF', display: 'inline-block' }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>Earning</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#06B6D4', display: 'inline-block' }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>Sales</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8', display: 'inline-block' }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>Refunds</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '190px' }}>
                          <ResponsiveContainer width="100%" height={170} minWidth={0} minHeight={0}>
                            <BarChart data={forecastDataOriginal} margin={{ top: 24, right: 10, left: -15, bottom: 4 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, dy: 6 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 500, dx: -4 }} tickFormatter={(v: any) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                              <ChartTooltip formatter={(v: any) => [formatMoney(Number(v)), '']} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-soft)' }} />
                              <Bar dataKey="Revenue" shape={<CustomBarShapeOriginal />} barSize={22} name="Revenue" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* Health Score Arc Gauge */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 18px', height: '285px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Financial Health Score</h3>
                    <MoreHorizontal size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                  </div>
                  
                  {/* ARC GAUGE SVG */}
                  <div style={{ position: 'relative', width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-4px' }}>
                    <svg width="220" height="120" viewBox="0 0 240 130">
                      {(() => {
                        const segments = [];
                        const totalSegments = 16;
                        const activeSegments = Math.round(0.88 * totalSegments); // 88%
                        const stepAngle = Math.PI / (totalSegments - 1);
                        const cx = 120;
                        const cy = 115;
                        const r_in = 71;
                        const r_out = 89;
                        for (let i = 0; i < totalSegments; i++) {
                          const angle = Math.PI - (i * Math.PI) / (totalSegments - 1);
                          const halfAngle = 0.45 * stepAngle / 2;
                          const angle1 = angle + halfAngle;
                          const angle2 = angle - halfAngle;
                          
                          const x_in_1 = cx + r_in * Math.cos(angle1);
                          const y_in_1 = cy - r_in * Math.sin(angle1);
                          const x_in_2 = cx + r_in * Math.cos(angle2);
                          const y_in_2 = cy - r_in * Math.sin(angle2);
                          const x_out_1 = cx + r_out * Math.cos(angle1);
                          const y_out_1 = cy - r_out * Math.sin(angle1);
                          const x_out_2 = cx + r_out * Math.cos(angle2);
                          const y_out_2 = cy - r_out * Math.sin(angle2);
                          
                          const filled = i < activeSegments;
                          
                          // Dynamically compute HSL color progression for active segments
                          let strokeColor = '#E2E8F0';
                          if (filled) {
                            const ratio = activeSegments > 1 ? i / (activeSegments - 1) : 0;
                            const hue = Math.round(224 - ratio * 18);
                            const lightness = Math.round(50 + ratio * 30);
                            strokeColor = `hsl(${hue}, 100%, ${lightness}%)`;
                          }
                          
                          const d = `M ${x_in_1} ${y_in_1} A ${r_in} ${r_in} 0 0 1 ${x_in_2} ${y_in_2} L ${x_out_2} ${y_out_2} A ${r_out} ${r_out} 0 0 0 ${x_out_1} ${y_out_1} Z`;
                          
                          segments.push(
                            <path
                              key={i}
                              d={d}
                              fill={strokeColor}
                              stroke={strokeColor}
                              strokeWidth={6}
                              strokeLinejoin="round"
                            />
                          );
                        }
                        return segments;
                      })()}
                    </svg>
                    
                    {/* Centered Score */}
                    <div style={{ position: 'absolute', bottom: '18px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>88%</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Healthy</span>
                    </div>
                  </div>

                  {/* Bottom Progress Bar Layout (matching Sales Overview reference) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Health</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>88%</span>
                        {/* Short Progress Bar */}
                        <div style={{ width: '64px', height: '6px', backgroundColor: 'var(--border-medium)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #4F7CFF 0%, #93C5FD 100%)', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>Target</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Layout Split: Cash Flow vs widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                {/* Left: Cash Flow Table & Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Table: Cash Flow */}
                  <div className="card-premium" style={{ padding: '24px 0' }}>
                    <div style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Upcoming Cash Flow</h3>
                      <span className="pill-badge pill-badge-primary" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>Real-time</span>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table-premium">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Client / Vendor</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ...receivables.map(r => ({ ...r, type: 'Incoming' as const, name: r.client })),
                            ...payables.map(p => ({ ...p, type: 'Outgoing' as const, name: p.vendor }))
                          ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5).map((item, idx) => {
                            const isIncoming = item.type === 'Incoming';
                            return (
                              <tr key={idx}>
                                <td>
                                  <span className={`pill-badge ${isIncoming ? 'pill-badge-success' : 'pill-badge-risk'}`} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                                    {item.type}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {isIncoming ? (item as any).invoice : (item as any).expense}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 800 }}>
                                  {formatMoney(item.amount, item.currency)}
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {new Date(item.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </td>
                                <td>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: item.status === 'paid' ? 'var(--color-success-text)' : item.status === 'overdue' ? 'var(--color-risk-text)' : '#F59E0B'
                                  }}>
                                    {item.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AI Financial Insights */}
                  <div className="card-premium">
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                      <span>AI Financial Insights & Recommendations</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      {getDynamicAIInsights().map((insight) => {
                        let dotColor = 'var(--color-primary)';
                        if (insight.type === 'risk') dotColor = 'var(--color-risk)';
                        else if (insight.type === 'warning') dotColor = '#F59E0B'; // Warning / Amber color
                        else if (insight.type === 'success') dotColor = 'var(--color-success)';

                        return (
                          <div key={insight.id} className="card-premium" style={{ padding: '14px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'start' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, marginTop: '5px', flexShrink: 0 }}></div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>
                              {insight.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Revenue Summary, Expense Summary & Estimate Intelligence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Recurring revenue summary panel */}
                  <div className="card-premium">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Recurring Revenue Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'AMC Revenue', value: recurringRevenues.filter(r => r.revenueType === 'amc' && r.status === 'active').reduce((s, r) => s + r.amount, 0) || 200000 },
                        { label: 'Retainers', value: recurringRevenues.filter(r => r.revenueType === 'retainer' && r.status === 'active').reduce((s, r) => s + r.amount, 0) || 400000 },
                        { label: 'Dedicated Teams', value: recurringRevenues.filter(r => r.revenueType === 'dedicated_resource' && r.status === 'active').reduce((s, r) => s + r.amount, 0) || 300000 },
                        { label: 'Product Revenue', value: recurringRevenues.filter(r => r.revenueType === 'product' && r.status === 'active').reduce((s, r) => s + r.amount, 0) || 80000 },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recurring expenses summary panel */}
                  <div className="card-premium">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Recurring Expense Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'Payroll', value: recurringExpenses.filter(e => e.category === 'payroll' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 500000 },
                        { label: 'AI Tools', value: recurringExpenses.filter(e => e.category === 'ai_tools' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 40000 },
                        { label: 'Infrastructure', value: recurringExpenses.filter(e => e.category === 'infrastructure' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 80000 },
                        { label: 'Operations', value: recurringExpenses.filter(e => e.category === 'operations' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 30000 },
                        { label: 'Other Expenses', value: recurringExpenses.filter(e => e.category === 'other' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 20000 },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense Breakdown (Bar Visualization) */}
                  <div className="card-premium">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Expense Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(() => {
                        const payroll = recurringExpenses.filter(e => e.category === 'payroll' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 500000;
                        const ai = recurringExpenses.filter(e => e.category === 'ai_tools' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 40000;
                        const infra = recurringExpenses.filter(e => e.category === 'infrastructure' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 80000;
                        const ops = recurringExpenses.filter(e => e.category === 'operations' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 30000;
                        const other = recurringExpenses.filter(e => e.category === 'other' && e.status === 'active').reduce((s, r) => s + r.amount, 0) || 190000;
                        const total = payroll + ai + infra + ops + other || 840000;
                        
                        return [
                          { label: 'Payroll', val: payroll, color: '#4F7CFF' },
                          { label: 'AI Tools', val: ai, color: '#818cf8' },
                          { label: 'Infrastructure', val: infra, color: '#c084fc' },
                          { label: 'Operations', val: ops, color: '#FB923C' },
                          { label: 'Other', val: other, color: 'var(--text-muted)' },
                        ].map((item, idx) => {
                          const pct = ((item.val / total) * 100) || 0;
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ color: 'var(--text-primary)' }}>{pct.toFixed(0)}%</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--border-medium)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: item.color, width: `${pct}%`, borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Estimate Intelligence Panel */}
                  <div className="card-premium">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Estimate Intelligence</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Estimates</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>128</div>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Average Margin</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success-text)', marginTop: '2px' }}>31%</div>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>High Risk</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-risk-text)', marginTop: '2px' }}>2</div>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Saved Scenarios</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>{savedEstimates.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 1: ESTIMATE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Hero Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div className="breadcrumbs">
                    <span>Estimations</span>
                    <ChevronRight size={12} />
                    <span className="active">Smart Estimate</span>
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Pricing Estimate</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Simulate project billing rates, margin health indices, and cash NPV recovery.</p>
                </div>

                <div className="status-badge-container">
                  <div className="pill-badge pill-badge-success">
                    <span className="indicator-dot indicator-pulse"></span>
                    <span>Live Simulator Active</span>
                  </div>
                  <div className="pill-badge pill-badge-primary">
                    <Sparkles size={12} />
                    <span>Margin Confidence Index: {metrics.simConfidenceScore.toFixed(0)}%</span>
                  </div>
                  <div className="pill-badge pill-badge-muted">
                    <CheckCircle2 size={12} />
                    <span>Deterministic math verified</span>
                  </div>
                </div>
              </div>

              {/* Layout split grid */}
              <div className="layout-split" style={compareModeActive && compareScenarioId ? { gridTemplateColumns: windowWidth >= 1024 ? '4.5fr 5.5fr' : '1fr' } : {}}>
                
                {/* LEFT CONFIGURATION ZONE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Loader Zone & Dropzone */}
                  <div className="card-premium" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Estimate Scenarios & Imports</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <PremiumSelect
                        className="input-premium"
                        value={selectedScenarioId}
                        onChange={(e) => setSelectedScenarioId(e.target.value)}
                        style={{ flexGrow: 1, height: '38px', fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        <option value="">-- Select Scenario --</option>
                        {savedEstimates.map((est) => (
                          <option key={est.id} value={est.id}>
                            {est.projectName} ({est.clientName})
                          </option>
                        ))}
                      </PremiumSelect>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', height: '38px', minWidth: '60px', justifyContent: 'center' }}
                        onClick={() => {
                          if (!selectedScenarioId) {
                            alert("Please select a scenario to load.");
                            return;
                          }
                          loadArchivedEstimate(selectedScenarioId);
                          recompute();
                        }}
                      >
                        Load
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        className="btn-pill btn-pill-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', height: '34px', justifyContent: 'center' }}
                        onClick={() => {
                          if (confirm("Reset current simulation to blank state? This will clear all allocated resources.")) {
                            updateProjectEstimate({
                              projectName: 'New Estimate',
                              clientName: 'New Client',
                              clientRegion: 'US',
                              contractType: 'fixed_cost',
                              estimatedHours: 160,
                              deliveryTimelineDays: 30,
                              targetMargin: 35,
                              contingencyPercent: 10,
                              discountRate: 8,
                              simAiToolsCost: 0,
                              simSaasToolsCost: 0,
                              simInfraCost: 0,
                              simOtherCosts: 0
                            });
                            allocatedResources.forEach(res => deleteAllocatedResource(res.id));
                            setActiveAiTools(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: { ...prev[k], active: false } }), {}));
                            setActiveSaasTools(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: { ...prev[k], active: false } }), {}));
                            setActiveInfra(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: { ...prev[k], active: false } }), {}));
                            setActiveOtherCosts(prev => Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: 0 }), {}));
                            alert("Simulator reset.");
                          }
                        }}
                      >
                        <Plus size={14} style={{ marginRight: '4px' }} />
                        New Scenario
                      </button>
                      <button
                        className="btn-pill btn-pill-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', height: '34px', justifyContent: 'center' }}
                        onClick={() => {
                          const pName = prompt("Enter name for duplicated scenario:", `${projectEstimate.projectName} (Copy)`);
                          if (pName) {
                            saveActiveEstimate(pName, projectEstimate.clientName);
                            alert(`Scenario duplicated as "${pName}"`);
                          }
                        }}
                      >
                        <History size={14} style={{ marginRight: '4px' }} />
                        Duplicate
                      </button>
                    </div>
                    
                    {/* Compare Scenarios Selector */}
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="compare-mode-toggle"
                          checked={compareModeActive}
                          onChange={(e) => setCompareModeActive(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-medium)',
                            cursor: 'pointer',
                            accentColor: 'var(--color-primary)'
                          }}
                        />
                        <label htmlFor="compare-mode-toggle" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          Enable Compare Mode (Side-by-Side)
                        </label>
                      </div>
                      
                      {compareModeActive && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }} className="animate-scale-in">
                          <PremiumSelect
                            className="input-premium"
                            value={compareScenarioId}
                            onChange={(e) => setCompareScenarioId(e.target.value)}
                            style={{ flexGrow: 1, height: '34px', fontSize: '0.8rem', padding: '4px 10px' }}
                          >
                            <option value="">-- Select Scenario to Compare --</option>
                            {savedEstimates.map((est) => (
                              <option key={est.id} value={est.id}>
                                {est.projectName} ({est.clientName})
                              </option>
                            ))}
                          </PremiumSelect>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Accordion 1: Project Details & Region Benchmarks */}
                  <div className="card-premium" style={{ padding: '0', overflow: 'hidden', zIndex: 9 }}>
                    <div 
                      onClick={() => setExpandedSections(prev => ({ ...prev, project: !prev.project }))}
                      style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-input)' }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>Project Details & Region Benchmarks</span>
                      </h3>
                      {expandedSections.project ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expandedSections.project && (
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Name</label>
                            <input 
                              className="input-premium" 
                              type="text" 
                              value={projectEstimate.projectName} 
                              onChange={(e) => updateProjectEstimate({ projectName: e.target.value })} 
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Client Name</label>
                              <button
                                type="button"
                                onClick={() => {
                                  setEnterEstimateClientManually(!enterEstimateClientManually);
                                  updateProjectEstimate({ clientName: '' });
                                }}
                                style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                              >
                                {enterEstimateClientManually ? "Select from Directory" : "Enter Manually"}
                              </button>
                            </div>
                            {enterEstimateClientManually ? (
                              <input 
                                className="input-premium" 
                                type="text" 
                                value={projectEstimate.clientName} 
                                onChange={(e) => updateProjectEstimate({ clientName: e.target.value })} 
                              />
                            ) : (
                              <PremiumSelect
                                value={projectEstimate.clientName}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  if (selectedName === 'MANUAL_ENTRY') {
                                    setEnterEstimateClientManually(true);
                                    updateProjectEstimate({ clientName: '' });
                                  } else {
                                    const cust = customers.find(c => c.name === selectedName);
                                    if (cust) {
                                      updateProjectEstimate({ 
                                        clientName: cust.name,
                                        clientRegion: cust.region
                                      });
                                    } else {
                                      updateProjectEstimate({ clientName: selectedName });
                                    }
                                  }
                                }}
                                className="input-premium"
                                style={{ height: '42px', padding: '0 20px' }}
                              >
                                <option value="">-- Select Customer --</option>
                                {customers.map(c => (
                                  <option key={c.id} value={c.name}>{c.name} ({c.companyName})</option>
                                ))}
                                <option value="MANUAL_ENTRY">-- Enter Manually / Custom --</option>
                              </PremiumSelect>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Client Region</label>
                            <PremiumSelect 
                              className="input-premium" 
                              value={projectEstimate.clientRegion} 
                              onChange={(e) => updateProjectEstimate({ clientRegion: e.target.value })}
                            >
                              <option value="US">US</option>
                              <option value="UK">UK</option>
                              <option value="UAE">UAE</option>
                              <option value="India">India</option>
                            </PremiumSelect>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Billing Model</label>
                            <PremiumSelect 
                              className="input-premium" 
                              value={projectEstimate.contractType} 
                              onChange={(e) => updateProjectEstimate({ contractType: e.target.value as any })}
                            >
                              <option value="hourly">Hourly</option>
                              <option value="fixed_cost">Fixed Cost</option>
                              <option value="retainer">Retainer</option>
                              <option value="dedicated_team">Dedicated Resource</option>
                              <option value="amc">AMC</option>
                            </PremiumSelect>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Project Hours</label>
                              <input 
                                className="input-premium" 
                                type="number" 
                                value={projectEstimate.estimatedHours} 
                                onChange={(e) => updateProjectEstimate({ estimatedHours: Math.max(0, parseInt(e.target.value) || 0) })} 
                                style={{ width: '80px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                              />
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="2000" 
                              step="10" 
                              value={projectEstimate.estimatedHours} 
                              onChange={(e) => updateProjectEstimate({ estimatedHours: parseInt(e.target.value) })}
                              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Delivery Timeline (Days)</label>
                              <input 
                                className="input-premium" 
                                type="number" 
                                value={projectEstimate.deliveryTimelineDays} 
                                onChange={(e) => updateProjectEstimate({ deliveryTimelineDays: Math.max(1, parseInt(e.target.value) || 1) })} 
                                style={{ width: '80px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                              />
                            </div>
                            <input 
                              type="range" 
                              min="5" 
                              max="365" 
                              step="5" 
                              value={projectEstimate.deliveryTimelineDays} 
                              onChange={(e) => updateProjectEstimate({ deliveryTimelineDays: parseInt(e.target.value) })}
                              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                          </div>
                        </div>

                        {/* Regional Pricing Intelligence block */}
                        {(() => {
                          const rBenchmark = benchmarks.find(b => b.regionName.toUpperCase() === projectEstimate.clientRegion.toUpperCase());
                          if (!rBenchmark) return null;
                          const currencySymbol = rBenchmark.currency === 'INR' ? '₹' : rBenchmark.currency === 'GBP' ? '£' : '$';
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Globe size={12} />
                                <span>{projectEstimate.clientRegion} Market Intelligence</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Benchmark Range:</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {currencySymbol}{rBenchmark.minimumRate} - {currencySymbol}{rBenchmark.enterpriseRate}/hr
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Recommended Rate:</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success-text)' }}>
                                  {currencySymbol}{rBenchmark.averageRate}/hr
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Resource & Cost Allocation Engine */}
                  <div className="card-premium" style={{ padding: '0', overflow: 'hidden', zIndex: 8 }}>
                    <div 
                      onClick={() => setExpandedSections(prev => ({ ...prev, resources: !prev.resources }))}
                      style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-input)' }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>Resource & Cost Allocation Engine</span>
                      </h3>
                      {expandedSections.resources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expandedSections.resources && (
                      <div style={{ borderTop: '1px solid var(--border-light)' }}>
                        {/* Sub-tabs switcher */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', padding: '0 12px' }}>
                          {(['hr', 'ai', 'saas', 'infra', 'other'] as const).map((tab) => {
                            const tabLabel = tab === 'hr' ? 'Human Resources' :
                                             tab === 'ai' ? 'AI Tools' :
                                             tab === 'saas' ? 'SaaS Tools' :
                                             tab === 'infra' ? 'Cloud Infrastructure' : 'Other Costs';
                            const isActive = resourcesTab === tab;
                            return (
                              <button
                                key={tab}
                                onClick={() => setResourcesTab(tab)}
                                style={{
                                  padding: '12px 14px',
                                  fontSize: '0.75rem',
                                  fontWeight: isActive ? 800 : 500,
                                  color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                                  border: 'none',
                                  background: 'none',
                                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                                  cursor: 'pointer',
                                  transition: 'all var(--transition-fast)'
                                }}
                              >
                                {tabLabel}
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ padding: '20px' }}>
                          {/* SUBTAB: HUMAN RESOURCES */}
                          {resourcesTab === 'hr' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              
                              {/* Allocate resource sub-form */}
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Staff Role</label>
                                  <PremiumSelect
                                    className="input-premium"
                                    value={resAllocationInput.employeeId}
                                    onChange={(e) => setResAllocationInput({ ...resAllocationInput, employeeId: e.target.value })}
                                    style={{ height: '34px', fontSize: '0.8rem', padding: '4px 8px' }}
                                  >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map((emp) => (
                                      <option key={emp.id} value={emp.id}>{emp.roleName} ({emp.department})</option>
                                    ))}
                                  </PremiumSelect>
                                </div>
                                <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hours</label>
                                  <input
                                    className="input-premium"
                                    type="number"
                                    value={resAllocationInput.allocatedHours}
                                    onChange={(e) => setResAllocationInput({ ...resAllocationInput, allocatedHours: Math.max(1, parseInt(e.target.value) || 0) })}
                                    style={{ height: '34px', fontSize: '0.8rem', padding: '4px 8px', textAlign: 'right' }}
                                  />
                                </div>
                                <button
                                  className="btn-pill btn-pill-primary"
                                  style={{ height: '34px', fontSize: '0.8rem', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => {
                                    if (!resAllocationInput.employeeId) {
                                      alert("Please select a resource to allocate.");
                                      return;
                                    }
                                    addAllocatedResource({
                                      employeeId: resAllocationInput.employeeId,
                                      allocatedHours: resAllocationInput.allocatedHours,
                                      quantity: 1
                                    });
                                    setResAllocationInput(prev => ({ ...prev, employeeId: '' }));
                                  }}
                                >
                                  <Plus size={14} />
                                  Add
                                </button>
                              </div>

                              {/* Compact row records */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Allocated Resources</span>
                                {allocatedResources.length === 0 ? (
                                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-medium)', borderRadius: '12px' }}>
                                    No staff resources currently allocated to this simulation.
                                  </div>
                                ) : (
                                  allocatedResources.map((ar) => {
                                    const emp = employees.find(e => e.id === ar.employeeId);
                                    if (!emp) return null;

                                    const activeCapacity = Math.max(1, metrics.totalProductiveHoursMonth);
                                    const overheadSharePerHour = (metrics.totalInfraCostMonth + metrics.totalSaaSCostMonth + metrics.totalOverheadCostMonth) / activeCapacity;
                                    const monthlySalaryInBase = convertCurrency(emp.annualSalary / 12, emp.salaryCurrency, baseCurrency, exchangeRates);
                                    const productiveHours = calculateProductiveHours(emp.totalWorkingHoursMonth, emp.meetingsHours, emp.operationsHours, emp.leaveHours, emp.internalSupportHours, emp.learningHours);
                                    const employeeCostAllocation = overheadSharePerHour * productiveHours;
                                    const empEffectiveHourlyCost = calculateEffectiveHourlyCost(monthlySalaryInBase, employeeCostAllocation, productiveHours);

                                    return (
                                      <div 
                                        key={ar.id} 
                                        style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between', 
                                          padding: '8px 12px', 
                                          backgroundColor: 'var(--bg-card)', 
                                          border: '1px solid var(--border-medium)', 
                                          borderRadius: '8px',
                                          fontSize: '0.8rem',
                                          gap: '12px'
                                        }}
                                      >
                                        <div style={{ flex: 2, minWidth: '120px' }}>
                                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.roleName}</div>
                                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cost: {formatMoney(empEffectiveHourlyCost)}/hr</div>
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
                                          <input
                                            type="number"
                                            className="input-premium"
                                            value={ar.allocatedHours}
                                            onChange={(e) => updateAllocatedResource(ar.id, { allocatedHours: Math.max(1, parseInt(e.target.value) || 1) })}
                                            style={{ width: '60px', height: '26px', padding: '2px 6px', fontSize: '0.75rem', textAlign: 'right' }}
                                          />
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>hrs</span>
                                        </div>

                                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)', minWidth: '70px' }}>
                                          {formatMoney(empEffectiveHourlyCost * ar.allocatedHours)}
                                        </div>

                                        <button 
                                          className="circle-btn" 
                                          style={{ width: '26px', height: '26px', color: 'var(--color-risk)' }} 
                                          onClick={() => deleteAllocatedResource(ar.id)}
                                        >
                                          <Trash size={12} />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}

                          {/* SUBTAB: AI TOOLS */}
                          {resourcesTab === 'ai' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Simulate AI Seat Licences</span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {Object.entries(activeAiTools).map(([toolName, val]) => (
                                  <div 
                                    key={toolName} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      padding: '10px 12px', 
                                      backgroundColor: val.active ? 'var(--color-primary-light)' : 'var(--bg-input)', 
                                      border: '1px solid var(--border-medium)', 
                                      borderRadius: '10px' 
                                    }}
                                  >
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexGrow: 1 }}>
                                      <input 
                                        type="checkbox" 
                                        checked={val.active} 
                                        onChange={(e) => setActiveAiTools(prev => ({ ...prev, [toolName]: { ...prev[toolName], active: e.target.checked } }))} 
                                        style={{ accentColor: 'var(--color-primary)' }}
                                      />
                                      <span>{toolName}</span>
                                    </label>
                                    <input 
                                      type="number" 
                                      className="input-premium" 
                                      value={val.cost} 
                                      onChange={(e) => setActiveAiTools(prev => ({ ...prev, [toolName]: { ...prev[toolName], cost: Math.max(0, parseFloat(e.target.value) || 0) } }))} 
                                      style={{ width: '70px', height: '24px', padding: '2px 6px', fontSize: '0.75rem', textAlign: 'right' }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SUBTAB: SAAS TOOLS */}
                          {resourcesTab === 'saas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Simulate SaaS Tools</span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {Object.entries(activeSaasTools).map(([toolName, val]) => (
                                  <div 
                                    key={toolName} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      padding: '10px 12px', 
                                      backgroundColor: val.active ? 'var(--color-primary-light)' : 'var(--bg-input)', 
                                      border: '1px solid var(--border-medium)', 
                                      borderRadius: '10px' 
                                    }}
                                  >
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexGrow: 1 }}>
                                      <input 
                                        type="checkbox" 
                                        checked={val.active} 
                                        onChange={(e) => setActiveSaasTools(prev => ({ ...prev, [toolName]: { ...prev[toolName], active: e.target.checked } }))} 
                                        style={{ accentColor: 'var(--color-primary)' }}
                                      />
                                      <span>{toolName}</span>
                                    </label>
                                    <input 
                                      type="number" 
                                      className="input-premium" 
                                      value={val.cost} 
                                      onChange={(e) => setActiveSaasTools(prev => ({ ...prev, [toolName]: { ...prev[toolName], cost: Math.max(0, parseFloat(e.target.value) || 0) } }))} 
                                      style={{ width: '70px', height: '24px', padding: '2px 6px', fontSize: '0.75rem', textAlign: 'right' }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SUBTAB: CLOUD INFRASTRUCTURE */}
                          {resourcesTab === 'infra' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Simulate Server Infrastructure</span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {Object.entries(activeInfra).map(([toolName, val]) => (
                                  <div 
                                    key={toolName} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      padding: '10px 12px', 
                                      backgroundColor: val.active ? 'var(--color-primary-light)' : 'var(--bg-input)', 
                                      border: '1px solid var(--border-medium)', 
                                      borderRadius: '10px' 
                                    }}
                                  >
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexGrow: 1 }}>
                                      <input 
                                        type="checkbox" 
                                        checked={val.active} 
                                        onChange={(e) => setActiveInfra(prev => ({ ...prev, [toolName]: { ...prev[toolName], active: e.target.checked } }))} 
                                        style={{ accentColor: 'var(--color-primary)' }}
                                      />
                                      <span>{toolName}</span>
                                    </label>
                                    <input 
                                      type="number" 
                                      className="input-premium" 
                                      value={val.cost} 
                                      onChange={(e) => setActiveInfra(prev => ({ ...prev, [toolName]: { ...prev[toolName], cost: Math.max(0, parseFloat(e.target.value) || 0) } }))} 
                                      style={{ width: '70px', height: '24px', padding: '2px 6px', fontSize: '0.75rem', textAlign: 'right' }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SUBTAB: OTHER COSTS */}
                          {resourcesTab === 'other' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Additional Miscellaneous Projects Expenses</span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {Object.entries(activeOtherCosts).map(([fieldName, cost]) => (
                                  <div 
                                    key={fieldName} 
                                    style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '4px',
                                      padding: '10px 12px', 
                                      backgroundColor: 'var(--bg-input)', 
                                      border: '1px solid var(--border-medium)', 
                                      borderRadius: '10px' 
                                    }}
                                  >
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{fieldName}</label>
                                    <input 
                                      type="number" 
                                      className="input-premium" 
                                      value={cost} 
                                      onChange={(e) => setActiveOtherCosts(prev => ({ ...prev, [fieldName]: Math.max(0, parseFloat(e.target.value) || 0) }))} 
                                      style={{ width: '100%', height: '28px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right' }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Markup & Profitability Settings */}
                  <div className="card-premium" style={{ padding: '0', overflow: 'hidden', zIndex: 7 }}>
                    <div 
                      onClick={() => setExpandedSections(prev => ({ ...prev, profitability: !prev.profitability }))}
                      style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-input)' }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Percent size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>Markup & Profitability Settings</span>
                      </h3>
                      {expandedSections.profitability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expandedSections.profitability && (
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Profit Margin (%)</label>
                            <input 
                              className="input-premium" 
                              type="number" 
                              min="0"
                              max="90"
                              value={projectEstimate.targetMargin} 
                              onChange={(e) => updateProjectEstimate({ targetMargin: Math.max(0, Math.min(90, parseInt(e.target.value) || 0)) })} 
                              style={{ width: '60px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="80" 
                            value={projectEstimate.targetMargin} 
                            onChange={(e) => updateProjectEstimate({ targetMargin: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Safety Contingency (%)</label>
                            <input 
                              className="input-premium" 
                              type="number" 
                              min="0"
                              max="50"
                              value={projectEstimate.contingencyPercent} 
                              onChange={(e) => updateProjectEstimate({ contingencyPercent: Math.max(0, Math.min(50, parseInt(e.target.value) || 0)) })} 
                              style={{ width: '60px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={projectEstimate.contingencyPercent} 
                            onChange={(e) => updateProjectEstimate({ contingencyPercent: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Annual Discount Rate (NPV %)</label>
                            <input 
                              className="input-premium" 
                              type="number" 
                              min="0"
                              max="30"
                              value={projectEstimate.discountRate} 
                              onChange={(e) => updateProjectEstimate({ discountRate: Math.max(0, Math.min(30, parseInt(e.target.value) || 0)) })} 
                              style={{ width: '60px', padding: '2px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            value={projectEstimate.discountRate} 
                            onChange={(e) => updateProjectEstimate({ discountRate: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 4: Milestone Payment Structure */}
                  <div className="card-premium" style={{ padding: '0', overflow: 'hidden', zIndex: 6 }}>
                    <div 
                      onClick={() => setExpandedSections(prev => ({ ...prev, milestones: !prev.milestones }))}
                      style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-input)' }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>Milestone Payment Structure</span>
                      </h3>
                      {expandedSections.milestones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expandedSections.milestones && (
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Payout Preset Schedule</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button 
                              className="btn-pill btn-pill-secondary" 
                              style={{ padding: '6px 0', fontSize: '0.72rem', height: '30px', justifyContent: 'center' }}
                              onClick={() => setMilestonesPreset('upfront')}
                            >
                              100% Upfront
                            </button>
                            <button 
                              className="btn-pill btn-pill-secondary" 
                              style={{ padding: '6px 0', fontSize: '0.72rem', height: '30px', justifyContent: 'center' }}
                              onClick={() => setMilestonesPreset('halves')}
                            >
                              50/50 Halves
                            </button>
                            <button 
                              className="btn-pill btn-pill-secondary" 
                              style={{ padding: '6px 0', fontSize: '0.72rem', height: '30px', justifyContent: 'center' }}
                              onClick={() => setMilestonesPreset('standard')}
                            >
                              30/40/30 Std
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Detailed Milestones Payout</span>
                            <button 
                              className="btn-pill btn-pill-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.7rem', height: '24px', display: 'flex', alignItems: 'center', gap: '2px' }}
                              onClick={() => addMilestone({ name: 'New Milestone Phase', percentage: 10, paymentDelayDays: 30 })}
                            >
                              <Plus size={10} /> Add Phase
                            </button>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {milestones.map((ms) => (
                              <div key={ms.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                                <input 
                                  className="input-premium" 
                                  type="text" 
                                  value={ms.name} 
                                  onChange={(e) => updateMilestone(ms.id, { name: e.target.value })} 
                                  style={{ flex: 2, height: '28px', fontSize: '0.75rem', padding: '2px 6px' }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '80px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="number" 
                                    value={ms.percentage} 
                                    onChange={(e) => updateMilestone(ms.id, { percentage: Math.max(0, parseInt(e.target.value) || 0) })} 
                                    style={{ width: '45px', height: '28px', fontSize: '0.75rem', padding: '2px 4px', textAlign: 'right' }}
                                  />
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>%</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '90px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="number" 
                                    value={ms.paymentDelayDays} 
                                    onChange={(e) => updateMilestone(ms.id, { paymentDelayDays: Math.max(0, parseInt(e.target.value) || 0) })} 
                                    style={{ width: '45px', height: '28px', fontSize: '0.75rem', padding: '2px 4px', textAlign: 'right' }}
                                  />
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>days lag</span>
                                </div>
                                <button 
                                  className="circle-btn" 
                                  style={{ width: '24px', height: '24px', color: 'var(--color-risk)' }} 
                                  onClick={() => deleteMilestone(ms.id)}
                                >
                                  <Trash size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT LIVE PRICING INTELLIGENCE PANEL (STICKY) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="sticky-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {compareModeActive ? (
                      (() => {
                        const compareEstimate = savedEstimates.find(est => est.id === compareScenarioId);
                        if (!compareEstimate) {
                          return (
                            <div className="card-premium animate-pulse" style={{ padding: '32px 24px', textAlign: 'center', border: '1px dashed var(--border-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                              <Info size={32} style={{ color: 'var(--color-primary)' }} />
                              <div>
                                <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Compare Mode Active</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                  Please select a saved scenario from the <strong>Estimate Scenarios & Imports</strong> dropdown in the left panel to compare side-by-side.
                                </p>
                              </div>
                            </div>
                          );
                        }
                        
                        // Render Side-by-Side Comparison view
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Comparison Header */}
                            <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(79, 124, 255, 0.2)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                                <div style={{ textAlign: 'left' }}>
                                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Scenario Comparison Mode</h3>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Comparing active simulation against saved history</span>
                                </div>
                              </div>
                              <button 
                                className="btn-pill btn-pill-secondary" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px' }}
                                onClick={() => setCompareModeActive(false)}
                              >
                                Exit Comparison
                              </button>
                            </div>

                            {/* Grid containing two columns */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              
                              {/* COLUMN 1: ACTIVE ESTIMATE */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', textAlign: 'center', padding: '4px', backgroundColor: 'var(--color-primary-light)', borderRadius: '6px' }}>
                                  Active: {projectEstimate.projectName}
                                </div>

                                {/* Quote Banner */}
                                <section className="card-quote-banner" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recommended Quote</span>
                                    <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0', letterSpacing: '-0.03em' }}>
                                      {formatMoney(metrics.simRecommendedQuote)}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                      Margin: {projectEstimate.targetMargin}%
                                    </span>
                                  </div>
                                </section>

                                {/* Key Metrics */}
                                <div className="card-premium" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Blended Rate:</span>
                                    <span style={{ fontWeight: 800 }}>{formatMoney(metrics.simEffectiveBillingRate)}/hr</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Cost Burden:</span>
                                    <span style={{ fontWeight: 800 }}>{formatMoney(metrics.simOperationalCost)}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Contingency:</span>
                                    <span style={{ fontWeight: 800 }}>{formatMoney(metrics.simContingencyCost)} ({projectEstimate.contingencyPercent}%)</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>NPV Recovery:</span>
                                    <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{(metrics.simNPV / Math.max(1, metrics.simRecommendedQuote) * 100).toFixed(1)}%</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Confidence Score:</span>
                                    <span style={{ fontWeight: 800, color: metrics.simConfidenceScore > 75 ? 'var(--color-success-text)' : 'var(--color-risk-text)' }}>{Math.round(metrics.simConfidenceScore)}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMN 2: COMPARISON ESTIMATE */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', textAlign: 'center', padding: '4px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '6px' }}>
                                  Compare: {compareEstimate.projectName}
                                </div>

                                {/* Quote Banner */}
                                <section className="card-quote-banner" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Archived Quote</span>
                                    <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0', letterSpacing: '-0.03em' }}>
                                      {formatMoney(compareEstimate.recommendedQuote)}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                      Margin: {compareEstimate.targetMargin}%
                                    </span>
                                  </div>
                                </section>

                                {/* Key Metrics */}
                                <div className="card-premium" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Blended Rate:</span>
                                    <span style={{ fontWeight: 800 }}>{formatMoney(compareEstimate.recommendedQuote / compareEstimate.estimatedHours)}/hr</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Cost Burden:</span>
                                    <span style={{ fontWeight: 800 }}>{formatMoney(compareEstimate.recommendedQuote * (1 - compareEstimate.targetMargin/100))}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Contingency:</span>
                                    <span style={{ fontWeight: 800 }}>{compareEstimate.contingencyPercent}%</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>NPV Recovery (Est):</span>
                                    <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>96.0%</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Confidence Score:</span>
                                    <span style={{ fontWeight: 800, color: compareEstimate.confidenceScore > 75 ? 'var(--color-success-text)' : 'var(--color-risk-text)' }}>{Math.round(compareEstimate.confidenceScore)}%</span>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Side-by-side Metrics Comparison Table */}
                            <section className="card-premium" style={{ padding: '16px 20px' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sliders size={14} style={{ color: 'var(--color-primary)' }} />
                                <span>Detailed Comparison Table</span>
                              </h4>
                              <div style={{ overflowX: 'auto' }}>
                                <table className="table-premium" style={{ fontSize: '0.75rem', width: '100%' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ textAlign: 'left' }}>Metric</th>
                                      <th>Active Scenario</th>
                                      <th>Comparison Scenario</th>
                                      <th>Variance</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td style={{ fontWeight: 700, textAlign: 'left' }}>Recommended Quote</td>
                                      <td>{formatMoney(metrics.simRecommendedQuote)}</td>
                                      <td>{formatMoney(compareEstimate.recommendedQuote)}</td>
                                      {(() => {
                                        const diff = metrics.simRecommendedQuote - compareEstimate.recommendedQuote;
                                        const pct = compareEstimate.recommendedQuote > 0 ? (diff / compareEstimate.recommendedQuote) * 100 : 0;
                                        const color = diff >= 0 ? 'var(--color-success-text)' : 'var(--color-risk-text)';
                                        return <td style={{ color, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{pct.toFixed(1)}%</td>;
                                      })()}
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, textAlign: 'left' }}>Target Margin</td>
                                      <td>{projectEstimate.targetMargin}%</td>
                                      <td>{compareEstimate.targetMargin}%</td>
                                      {(() => {
                                        const diff = projectEstimate.targetMargin - compareEstimate.targetMargin;
                                        const color = diff >= 0 ? 'var(--color-success-text)' : 'var(--color-risk-text)';
                                        return <td style={{ color, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{diff.toFixed(1)}%</td>;
                                      })()}
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, textAlign: 'left' }}>Blended Billing Rate</td>
                                      <td>{formatMoney(metrics.simEffectiveBillingRate)}/hr</td>
                                      <td>{formatMoney(compareEstimate.recommendedQuote / compareEstimate.estimatedHours)}/hr</td>
                                      {(() => {
                                        const rateActive = metrics.simEffectiveBillingRate;
                                        const rateComp = compareEstimate.recommendedQuote / compareEstimate.estimatedHours;
                                        const diff = rateActive - rateComp;
                                        const pct = rateComp > 0 ? (diff / rateComp) * 100 : 0;
                                        const color = diff >= 0 ? 'var(--color-success-text)' : 'var(--color-risk-text)';
                                        return <td style={{ color, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{pct.toFixed(1)}%</td>;
                                      })()}
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, textAlign: 'left' }}>Estimated Hours</td>
                                      <td>{projectEstimate.estimatedHours} hrs</td>
                                      <td>{compareEstimate.estimatedHours} hrs</td>
                                      {(() => {
                                        const diff = projectEstimate.estimatedHours - compareEstimate.estimatedHours;
                                        const color = diff <= 0 ? 'var(--color-success-text)' : 'var(--color-risk-text)';
                                        return <td style={{ color, fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff} hrs</td>;
                                      })()}
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, textAlign: 'left' }}>Confidence Rating</td>
                                      <td>{Math.round(metrics.simConfidenceScore)}%</td>
                                      <td>{Math.round(compareEstimate.confidenceScore)}%</td>
                                      {(() => {
                                        const diff = metrics.simConfidenceScore - compareEstimate.confidenceScore;
                                        const color = diff >= 0 ? 'var(--color-success-text)' : 'var(--color-risk-text)';
                                        return <td style={{ color, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}{Math.round(diff)}%</td>;
                                      })()}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </section>
                          </div>
                        );
                      })()
                    ) : (
                      <>
                        {/* Glowing Quote Banner Card - REDUCED SIZE BY 20-25% */}
                        <section className="card-quote-banner" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {companyProfile.companyLogo && (
                          <img
                            src={companyProfile.companyLogo}
                            alt={companyProfile.companyName || "Logo"}
                            style={{
                              maxHeight: '32px',
                              maxWidth: '120px',
                              objectFit: 'contain',
                              marginBottom: '8px'
                            }}
                          />
                        )}
                        <div className="pill-badge pill-badge-primary" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(5px)', border: '1px solid #ffffff', marginBottom: '12px', padding: '3px 10px' }}>
                          <Sparkles size={11} style={{ color: 'var(--color-primary)' }} />
                          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.7rem' }}>Recommended Quotation</span>
                        </div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>
                          {formatMoney(metrics.simRecommendedQuote)}
                        </h2>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Target Margin {projectEstimate.targetMargin}%</span>
                          <span style={{ color: 'var(--text-muted)' }}>•</span>
                          <span style={{ color: 'var(--color-success-text)' }}>Expected Profit {formatMoney(metrics.simRecommendedQuote * (projectEstimate.targetMargin / 100))}</span>
                        </div>
                        
                        <button
                          className="btn-pill btn-pill-primary"
                          style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-primary)',
                            boxShadow: 'none',
                            fontWeight: 700,
                            height: '36px',
                            fontSize: '0.8rem'
                          }}
                          onClick={() => {
                            const pName = prompt("Enter Project Name to save scenario:", projectEstimate.projectName);
                            const cName = prompt("Enter Client Name to save scenario:", projectEstimate.clientName);
                            if (pName || cName) {
                              saveActiveEstimate(pName || '', cName || '');
                              alert("Estimate scenario saved successfully!");
                            }
                          }}
                        >
                          <Zap size={13} style={{ marginRight: '6px' }} />
                          Save Current Simulation
                        </button>

                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-medium)',
                            boxShadow: 'none',
                            fontWeight: 700,
                            height: '36px',
                            fontSize: '0.8rem',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => window.print()}
                        >
                          <Printer size={13} style={{ marginRight: '6px' }} />
                          Print Estimate Breakdown
                        </button>
                      </div>
                    </section>

                    {/* Live Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100px' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blended Rate</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                          {formatMoney(metrics.simEffectiveBillingRate)}/hr
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600 }}>Active project average</span>
                      </div>

                      <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100px' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost Burden</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                          {formatMoney(metrics.simOperationalCost)}
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>Direct + shared burden</span>
                      </div>
                    </div>

                    {/* Pricing Risk & Health Matrix Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {/* Risk Coefficient Widget */}
                      {(() => {
                        const riskCoef = Math.max(10, Math.min(95, Math.round(100 - metrics.simMarginHealthScore + (projectEstimate.contractType === 'fixed_cost' ? 12 : 4) + (metrics.simNPV < metrics.simRecommendedQuote * 0.95 ? 10 : 0))));
                        const riskColor = riskCoef > 60 ? 'var(--color-risk)' : riskCoef > 35 ? '#FB923C' : 'var(--color-success)';
                        const sparklinePath = riskCoef > 60 
                          ? "M 5,32 C 25,28 35,38 60,20 C 80,10 95,8 115,2" 
                          : "M 5,8 C 25,12 35,5 60,22 C 80,28 95,30 115,35";
                        return (
                          <div className="card-premium" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', height: '105px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Coefficient</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: riskColor }}>{riskCoef}%</span>
                            </div>
                            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 120 40" style={{ width: '100%', height: '28px', overflow: 'visible' }}>
                                <path d={sparklinePath} fill="none" stroke={riskColor} strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="115" cy={riskCoef > 60 ? 2 : 35} r="3.5" fill={riskColor} />
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                              {riskCoef > 60 ? 'High contract risk exposure' : 'Stable billing boundaries'}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Health Matrix Widget */}
                      <div className="card-premium" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', height: '105px' }}>
                        {(() => {
                          const r = 16;
                          const circ = 2 * Math.PI * r;
                          const offset = circ - (metrics.simConfidenceScore / 100) * circ;
                          const healthColor = metrics.simConfidenceScore > 75 ? 'var(--color-primary)' : metrics.simConfidenceScore > 45 ? '#818cf8' : 'var(--color-risk)';
                          return (
                            <>
                              <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                  <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border-light)" strokeWidth="3" />
                                  <circle 
                                    cx="20" 
                                    cy="20" 
                                    r={r} 
                                    fill="none" 
                                    stroke={healthColor} 
                                    strokeWidth="3" 
                                    strokeDasharray={circ} 
                                    strokeDashoffset={offset} 
                                    strokeLinecap="round" 
                                    transform="rotate(-90 20 20)"
                                  />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {Math.round(metrics.simConfidenceScore)}%
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Matrix</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: healthColor }}>
                                  {metrics.simConfidenceScore > 75 ? 'Strong Margin' : metrics.simConfidenceScore > 45 ? 'Adequate' : 'Fragile'}
                                </span>
                                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Confidence score</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* NPV Recovery Card */}
                    <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NPV Recovery & Cash Lag</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {(metrics.simNPV / Math.max(1, metrics.simRecommendedQuote) * 100).toFixed(1)}% NPV
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {milestones.reduce((sum, ms) => sum + (ms.percentage / 100) * ms.paymentDelayDays, 0).toFixed(0)} days lag
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Weighted milestone recovery timeline</span>
                    </div>

                    {/* Cost Breakdown Stacked Progress Bar */}
                    {(() => {
                      const totalVal = metrics.simOperationalCost + metrics.simContingencyCost;
                      const hrPct = totalVal > 0 ? (metrics.simWorkforceCost / totalVal) * 100 : 0;
                      const aiPct = totalVal > 0 ? ((projectEstimate.simAiToolsCost || 0) / totalVal) * 100 : 0;
                      const infraPct = totalVal > 0 ? ((projectEstimate.simInfraCost || 0) / totalVal) * 100 : 0;
                      const saasPct = totalVal > 0 ? ((projectEstimate.simSaasToolsCost || 0) / totalVal) * 100 : 0;
                      const opsPct = totalVal > 0 ? ((metrics.simOverheadCost + (projectEstimate.simOtherCosts || 0)) / totalVal) * 100 : 0;
                      const contPct = totalVal > 0 ? (metrics.simContingencyCost / totalVal) * 100 : 0;
                      return (
                        <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Breakdown</span>
                          
                          <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: 'var(--border-light)' }}>
                            {hrPct > 0 && <div style={{ width: `${hrPct}%`, backgroundColor: '#4F7CFF' }} title={`Staff: ${hrPct.toFixed(0)}%`} />}
                            {aiPct > 0 && <div style={{ width: `${aiPct}%`, backgroundColor: '#A855F7' }} title={`AI: ${aiPct.toFixed(0)}%`} />}
                            {infraPct > 0 && <div style={{ width: `${infraPct}%`, backgroundColor: '#EAB308' }} title={`Infra: ${infraPct.toFixed(0)}%`} />}
                            {saasPct > 0 && <div style={{ width: `${saasPct}%`, backgroundColor: '#EC4899' }} title={`SaaS: ${saasPct.toFixed(0)}%`} />}
                            {opsPct > 0 && <div style={{ width: `${opsPct}%`, backgroundColor: '#64748B' }} title={`Ops/Others: ${opsPct.toFixed(0)}%`} />}
                            {contPct > 0 && <div style={{ width: `${contPct}%`, backgroundColor: '#F97316' }} title={`Contingency: ${contPct.toFixed(0)}%`} />}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 8px', fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F7CFF' }} />
                              <span>Staff ({hrPct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A855F7' }} />
                              <span>AI ({aiPct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EAB308' }} />
                              <span>Infra ({infraPct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EC4899' }} />
                              <span>SaaS ({saasPct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748B' }} />
                              <span>Ops ({opsPct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                              <span>Contingency ({contPct.toFixed(0)}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quote Composition Math Formula block */}
                    <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quote Composition</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Direct Costs (Staff + Tools)</span>
                          <span>{formatMoney(metrics.simWorkforceCost + (projectEstimate.simAiToolsCost || 0) + (projectEstimate.simSaasToolsCost || 0) + (projectEstimate.simInfraCost || 0))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>+ Operations & Overheads</span>
                          <span>{formatMoney(metrics.simOverheadCost + (projectEstimate.simOtherCosts || 0))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>+ Contingency ({projectEstimate.contingencyPercent}%)</span>
                          <span>{formatMoney(metrics.simContingencyCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 700, borderTop: '1px solid var(--border-medium)', paddingTop: '6px' }}>
                          <span>Total Cost Burden</span>
                          <span>{formatMoney(metrics.simOperationalCost + metrics.simContingencyCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success-text)', fontWeight: 800 }}>
                          <span>+ Profit Margin ({projectEstimate.targetMargin}%)</span>
                          <span>{formatMoney(metrics.simRecommendedQuote - (metrics.simOperationalCost + metrics.simContingencyCost))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 900, borderTop: '2px solid var(--text-primary)', paddingTop: '6px', fontSize: '0.85rem' }}>
                          <span>Recommended Quotation</span>
                          <span>{formatMoney(metrics.simRecommendedQuote)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Embedded AI Strategic Insights - DYNAMIC & CONTEXTUAL */}
                    <section className="card-premium">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                          <span>Pricing Intel Insights</span>
                        </h3>
                        <span className="pill-badge pill-badge-primary" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>Live</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Insight Card 1: Margin Check */}
                        {(() => {
                          const isSafe = projectEstimate.targetMargin >= marginPolicy.minimumSafeMargin;
                          const bg = isSafe ? 'var(--color-success-light)' : 'var(--color-risk-light)';
                          const border = isSafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 138, 101, 0.1)';
                          const borderLeft = isSafe ? 'var(--color-success)' : 'var(--color-risk)';
                          const iconColor = isSafe ? 'var(--color-success)' : 'var(--color-risk)';
                          const title = isSafe ? 'Margin Safety Cleared' : 'Underquoted Margin Alert';
                          const desc = isSafe 
                            ? `Your simulated ${projectEstimate.targetMargin}% profit margin is healthy and safe for delivery compared to minimum safety threshold (${marginPolicy.minimumSafeMargin}%).`
                            : `Profit margin of ${projectEstimate.targetMargin}% is below safe operating threshold (${marginPolicy.minimumSafeMargin}%). Raise target margin to recover overhead buffer.`;
                          
                          return (
                            <div style={{ position: 'relative', overflow: 'hidden', padding: '14px 16px', borderRadius: '16px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', gap: '10px', alignItems: 'start' }}>
                              <div style={{ width: '4px', position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: borderLeft }}></div>
                              {isSafe ? <CheckCircle2 size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} /> : <AlertCircle size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} />}
                              <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>
                                  {desc}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Insight Card 2: NPV Delay Check */}
                        {(() => {
                          const weightedDelay = milestones.reduce((sum, ms) => sum + (ms.percentage / 100) * ms.paymentDelayDays, 0);
                          const isNPVHealthy = weightedDelay <= 40;
                          const bg = isNPVHealthy ? 'var(--color-primary-light)' : 'var(--color-risk-light)';
                          const border = isNPVHealthy ? 'rgba(79, 124, 255, 0.1)' : 'rgba(255, 138, 101, 0.1)';
                          const borderLeft = isNPVHealthy ? 'var(--color-primary)' : 'var(--color-risk)';
                          const iconColor = isNPVHealthy ? 'var(--color-primary)' : 'var(--color-risk)';
                          const title = isNPVHealthy ? 'Cash Runway Solid' : 'NPV Cash Liquidity Risk';
                          const desc = isNPVHealthy
                            ? `Weighted payout delay of ${weightedDelay.toFixed(0)} days retains ${metrics.simCashRecoveryScore.toFixed(0)}% of project present value.`
                            : `Payment delay averaging ${weightedDelay.toFixed(0)} days erodes NPV to ${metrics.simCashRecoveryScore.toFixed(0)}%. Request larger upfront kickoff share (e.g. 40%+).`;
                          
                          return (
                            <div style={{ position: 'relative', overflow: 'hidden', padding: '14px 16px', borderRadius: '16px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', gap: '10px', alignItems: 'start' }}>
                              <div style={{ width: '4px', position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: borderLeft }}></div>
                              <Info size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>
                                  {desc}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Insight Card 3: Contingency Check */}
                        {(() => {
                          const isFixed = projectEstimate.contractType === 'fixed_cost';
                          const needContingency = isFixed && projectEstimate.contingencyPercent < 15;
                          const bg = needContingency ? 'var(--color-risk-light)' : 'var(--bg-input)';
                          const border = needContingency ? 'rgba(255, 138, 101, 0.1)' : 'var(--border-medium)';
                          const borderLeft = needContingency ? 'var(--color-risk)' : 'var(--text-muted)';
                          const iconColor = needContingency ? 'var(--color-risk)' : 'var(--text-muted)';
                          const title = needContingency ? 'Contingency Underfunded' : 'Contingency Allocation';
                          const desc = needContingency
                            ? `Fixed Price projects carry higher scope creep risk. Boost contingency above 15% (current: ${projectEstimate.contingencyPercent}%) to prevent margin leak.`
                            : `Contingency buffer of ${projectEstimate.contingencyPercent}% fits standard project configuration risks.`;
                          
                          return (
                            <div style={{ position: 'relative', overflow: 'hidden', padding: '14px 16px', borderRadius: '16px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', gap: '10px', alignItems: 'start' }}>
                              <div style={{ width: '4px', position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: borderLeft }}></div>
                              {needContingency ? <AlertCircle size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} /> : <Info size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} />}
                              <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>
                                  {desc}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </section>

                      </>
                    )}

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: CASH FLOW CALENDAR */}
          {activeTab === 'calendar' && (() => {
            const isMobile = windowWidth < 768;
            const isLaptop = windowWidth >= 768 && windowWidth < 1200;
            const panelWidth = isLaptop ? 300 : 340;

            // Calculations for the selected date contextual panel
            const selectedDayEvents = selectedCalDate ? filteredEvents.filter(ev => ev.date === selectedCalDate) : [];
            const selectedInflow = selectedDayEvents.filter(ev => ev.type.startsWith('receivable') && ev.status !== 'cancelled').reduce((sum, ev) => sum + ev.amount, 0);
            const selectedOutflow = selectedDayEvents.filter(ev => ev.type.startsWith('payable') && ev.status !== 'cancelled').reduce((sum, ev) => sum + ev.amount, 0);
            const selectedNet = selectedInflow - selectedOutflow;

            const totalReceivables = selectedInflow;
            const totalPayables = selectedOutflow;
            const netPos = selectedNet;

            const revBreakdown = selectedDayEvents.filter(ev => ev.type === 'receivable_one_time').reduce((sum, ev) => sum + ev.amount, 0);
            const expBreakdown = selectedDayEvents.filter(ev => ev.type === 'payable_one_time').reduce((sum, ev) => sum + ev.amount, 0);
            const recRevBreakdown = selectedDayEvents.filter(ev => ev.type === 'receivable_recurring').reduce((sum, ev) => sum + ev.amount, 0);
            const recExpBreakdown = selectedDayEvents.filter(ev => ev.type === 'payable_recurring').reduce((sum, ev) => sum + ev.amount, 0);

            const getFormattedSelectedDate = (dateStr: string) => {
              const d = new Date(dateStr);
              return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const renderPanelContent = () => (
              <>
                {/* Panel Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SELECTED DATE</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCalDate(null);
                    }}
                    className="circle-btn"
                    style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                  {selectedCalDate ? getFormattedSelectedDate(selectedCalDate) : ''}
                </h3>

                {/* Daily Summary */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Daily Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inflow</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{formatMoney(selectedInflow)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Outflow</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>{formatMoney(selectedOutflow)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Net Position</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: selectedNet >= 0 ? '#10b981' : '#ef4444' }}>
                        {selectedNet > 0 ? '+' : ''}{formatMoney(selectedNet)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Events Scheduled */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Events Scheduled</h4>
                  {selectedDayEvents.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                      No events scheduled for this day.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedDayEvents.map((ev, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                            setIsDetailDrawerOpen(true);
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                          className="event-card-hover"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="pill-badge pill-badge-muted" style={{ fontSize: '0.58rem', padding: '1px 5px', textTransform: 'capitalize' }}>
                              {ev.type.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ev.type.startsWith('receivable') ? '#10b981' : '#ef4444' }}>
                              {formatMoney(ev.amount)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day Statistics */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Day Statistics</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Receivables</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatMoney(totalReceivables)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Payables</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatMoney(totalPayables)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Net Position</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: netPos >= 0 ? '#10b981' : '#ef4444' }}>
                        {netPos > 0 ? '+' : ''}{formatMoney(netPos)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Category Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 8px' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)' }}>REVENUE</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginTop: '1px' }}>{formatMoney(revBreakdown)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 8px' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)' }}>EXPENSES</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginTop: '1px' }}>{formatMoney(expBreakdown)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 8px' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECURRING REV</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginTop: '1px' }}>{formatMoney(recRevBreakdown)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 8px' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECURRING EXP</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', marginTop: '1px' }}>{formatMoney(recExpBreakdown)}</div>
                    </div>
                  </div>
                </div>

                {/* View Full Details Button */}
                <button
                  className="btn-pill btn-pill-secondary"
                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', fontWeight: 700, justifyContent: 'center' }}
                  onClick={() => {
                    if (selectedDayEvents.length > 0) {
                      setSelectedEvent(selectedDayEvents[0]);
                      setIsDetailDrawerOpen(true);
                    } else {
                      alert('No events on this day to inspect.');
                    }
                  }}
                >
                  View Full Details
                </button>
              </>
            );

            return (
              <div
                ref={calendarTabRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : (selectedCalDate ? `1fr ${panelWidth}px` : '1fr 0px'),
                  gap: isMobile || !selectedCalDate ? '0px' : '24px',
                  width: '100%',
                  alignItems: 'start',
                  transition: 'grid-template-columns 250ms cubic-bezier(0.16, 1, 0.3, 1), gap 250ms ease'
                }}
              >
                
                {/* Left Zone: Main Calendar Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, flex: 1 }}>
                  
                  {/* Spacing group to minimize whitespace */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    
                    {/* Header Row: Navigation & Search */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevMonth();
                          }}
                          className="circle-btn"
                          style={{
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-medium)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                          title="Previous Month"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, minWidth: '120px', textAlign: 'center' }}>
                          {new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]) - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextMonth();
                          }}
                          className="circle-btn"
                          style={{
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-medium)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                          title="Next Month"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Search Events input on right, width 220px */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '28px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
                        <input
                          placeholder="Search events..."
                          type="text"
                          value={calSearchQuery}
                          onChange={(e) => setCalSearchQuery(e.target.value)}
                          className="input-premium"
                          style={{ padding: '4px 10px 4px 26px', fontSize: '0.75rem', width: '220px', height: '28px' }}
                        />
                      </div>
                    </div>

                    {/* Calendar Insight Summary Row */}
                    {(() => {
                      const recOneTimeCount = filteredEvents.filter(ev => ev.type === 'receivable_one_time').length;
                      const recRecurringCount = filteredEvents.filter(ev => ev.type === 'receivable_recurring').length;
                      const payOneTimeCount = filteredEvents.filter(ev => ev.type === 'payable_one_time').length;
                      const payRecurringCount = filteredEvents.filter(ev => ev.type === 'payable_recurring').length;
                      const netPosVal = monthInflow - monthOutflow;

                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '2px 4px',
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)',
                          flexWrap: 'wrap',
                          marginTop: '2px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{recOneTimeCount}</span>
                            <span>Receivables</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{recRecurringCount}</span>
                            <span>Recurring Receivables</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{payOneTimeCount}</span>
                            <span>Payables</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{payRecurringCount}</span>
                            <span>Recurring Payables</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Net Position</span>
                            <span style={{
                              fontWeight: 800,
                              color: netPosVal >= 0 ? '#10b981' : '#ef4444'
                            }}>
                              {formatMoneyCompact(netPosVal)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  
                    {/* Calendar Grid Box */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-sm)',
                      minHeight: 'calc(100vh - 240px)',
                      overflow: 'hidden'
                    }}>
                      {/* Sun - Sat Header Row */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        backgroundColor: 'var(--bg-input)',
                        borderBottom: '1px solid var(--border-color)',
                        textAlign: 'center',
                        padding: '8px 0',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)'
                      }}>
                        {userPreferences?.startWeekOn === 'Monday' ? (
                          <>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                            <div>Sun</div>
                          </>
                        ) : (
                          <>
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                          </>
                        )}
                      </div>
                      
                      {/* Calendar Rows */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {weeks.map((week, wIdx) => {
                          const isWeekExpanded = week.some(cell => cell.dateStr === expandedCalDate);
                          
                          return (
                            <div
                              key={wIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                height: isWeekExpanded ? 'auto' : '135px',
                                flexShrink: 0,
                                flexGrow: 0,
                                borderBottom: wIdx === weeks.length - 1 ? 'none' : '1px solid var(--border-color)',
                                transition: 'height 300ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            >
                              {week.map((cell, cIdx) => {
                                const dayEvents = filteredEvents.filter(ev => ev.date === cell.dateStr);
                                const isDayToday = cell.dateStr === '2026-06-12';
                                const isSelected = cell.dateStr === selectedCalDate;
                                
                                // Calculate cell's day net position
                                const dayInflow = dayEvents.filter(ev => ev.type.startsWith('receivable') && ev.status !== 'cancelled').reduce((sum, ev) => sum + ev.amount, 0);
                                const dayOutflow = dayEvents.filter(ev => ev.type.startsWith('payable') && ev.status !== 'cancelled').reduce((sum, ev) => sum + ev.amount, 0);
                                const dayNet = dayInflow - dayOutflow;
                                
                                return (
                                  <CalendarDayCell
                                    key={cIdx}
                                    cell={cell}
                                    dayEvents={dayEvents}
                                    isDayToday={isDayToday}
                                    isSelected={isSelected}
                                    dayNet={dayNet}
                                    isExpanded={cell.dateStr === expandedCalDate}
                                    onExpand={() => setExpandedCalDate(cell.dateStr)}
                                    onCollapse={() => setExpandedCalDate(null)}
                                    onSelect={() => setSelectedCalDate(cell.dateStr)}
                                    formatMoney={formatMoney}
                                    formatMoneyCompact={formatMoneyCompact}
                                    setSelectedEvent={setSelectedEvent}
                                    setIsDetailDrawerOpen={setIsDetailDrawerOpen}
                                    isLastColumn={cIdx === 6}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Bottom Month Summary Strip */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 24px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    marginTop: '4px'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Month Summary ({new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]) - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })})
                    </span>
                    
                    <div style={{ display: 'flex', gap: '32px' }}>
                      {/* Total Inflow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#e6f7ed',
                          color: '#10b981'
                        }}>
                          <ArrowUpRight size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL INFLOW</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(monthInflow)}</span>
                        </div>
                      </div>
                      
                      {/* Total Outflow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444'
                        }}>
                          <ArrowUpRight size={18} style={{ transform: 'rotate(90deg)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL OUTFLOW</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(monthOutflow)}</span>
                        </div>
                      </div>
                      
                      {/* Net Cash Position */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#3b82f6'
                        }}>
                          <Wallet size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>NET CASH POSITION</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(monthInflow - monthOutflow)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>

                {/* Right Zone: Sliding Contextual Day Details Panel (Desktop/Laptop) */}
                {!isMobile && (
                  <aside style={{
                    width: selectedCalDate ? `${panelWidth}px` : '0px',
                    borderLeft: selectedCalDate ? '1px solid var(--border-color)' : 'none',
                    paddingLeft: selectedCalDate ? '24px' : '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    flexShrink: 0,
                    opacity: selectedCalDate ? 1 : 0,
                    transform: selectedCalDate ? 'translateX(0)' : 'translateX(20px)',
                    pointerEvents: selectedCalDate ? 'auto' : 'none',
                    transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1), padding-left 250ms ease, opacity 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                    alignSelf: 'stretch'
                  }}>
                    {selectedCalDate && (
                      <div style={{ width: `${panelWidth - 24}px`, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
                        {renderPanelContent()}
                      </div>
                    )}
                  </aside>
                )}

                {/* Mobile Contextual Day Details Bottom Sheet */}
                {isMobile && selectedCalDate && (
                  <div
                    style={{
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--bg-card)',
                      borderTop: '1px solid var(--border-color)',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      padding: '20px 24px 24px 24px',
                      maxHeight: '70vh',
                      overflowY: 'auto'
                    }}
                    className="mobile-bottom-sheet"
                  >
                    {/* Handle bar */}
                    <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--border-medium)', borderRadius: '2px', margin: '0 auto 16px auto' }} />
                    {renderPanelContent()}
                  </div>
                )}

              </div>
            );
          })()}
          
          {/* TAB: REVENUE */}
          {activeTab === 'revenue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recurring Revenue Management</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Track and forecast your AMC, retainers, subscriptions, and dedicated team revenues.</p>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Total MRR: <span style={{ color: 'var(--color-primary)' }}>{formatMoney(metrics.totalRecurringRevenueMonth)}</span>
                </div>
              </div>

              {/* Add Revenue Form */}
              <section className="card-premium">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>Configure Recurring Revenue Contract</span>
                </h3>
                                <div className="form-container-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Client Name</label>
                        <input className="input-premium" type="text" value={revenueForm.clientName} onChange={e => setRevenueForm({ ...revenueForm, clientName: e.target.value })} placeholder="Client Name" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Revenue Type</label>
                        <PremiumSelect className="input-premium" value={revenueForm.revenueType} onChange={e => setRevenueForm({ ...revenueForm, revenueType: e.target.value as any })}>
                          <option value="amc">AMC</option>
                          <option value="retainer">Retainer</option>
                          <option value="dedicated_resource">Dedicated Resource</option>
                          <option value="subscription">Subscription</option>
                          <option value="consulting">Consulting</option>
                          <option value="product">Product Revenue</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contract Amount</label>
                        <input className="input-premium" type="number" value={revenueForm.amount} onChange={e => setRevenueForm({ ...revenueForm, amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency</label>
                        <PremiumSelect className="input-premium" value={revenueForm.currency} onChange={e => setRevenueForm({ ...revenueForm, currency: e.target.value })}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="AED">AED (AED)</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Frequency</label>
                        <PremiumSelect className="input-premium" value={revenueForm.frequency} onChange={e => setRevenueForm({ ...revenueForm, frequency: e.target.value as any })}>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</label>
                        <input className="input-premium" type="date" value={revenueForm.startDate} onChange={e => setRevenueForm({ ...revenueForm, startDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>End Date</label>
                        <input className="input-premium" type="date" value={revenueForm.endDate} onChange={e => setRevenueForm({ ...revenueForm, endDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                        <PremiumSelect className="input-premium" value={revenueForm.status} onChange={e => setRevenueForm({ ...revenueForm, status: e.target.value as any })}>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="ended">Ended</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes</label>
                        <input className="input-premium" type="text" value={revenueForm.notes} onChange={e => setRevenueForm({ ...revenueForm, notes: e.target.value })} placeholder="Internal notes, contract terms, or deliverables details..." />
                      </div>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ gridColumn: '1 / -1', justifySelf: 'end', marginTop: '10px' }}
                        onClick={() => {
                          if (!revenueForm.clientName) {
                            alert('Please enter a client name.');
                            return;
                          }
                          addRecurringRevenue(revenueForm);
                          setRevenueForm({
                            clientName: '',
                            revenueType: 'retainer',
                            amount: 50000,
                            currency: baseCurrency,
                            frequency: 'monthly',
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: '',
                            status: 'active',
                            notes: ''
                          });
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Recurring Revenue</span>
                      </button>
                    </div>
              </section>

              {/* Revenue list table */}
              <section className="card-premium" style={{ padding: '24px 0' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Contract Details</th>
                        <th>Monthly rate</th>
                        <th>Start/End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurringRevenues.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No active recurring revenue contracts registered.
                          </td>
                        </tr>
                      ) : (
                        recurringRevenues.map((rev) => {
                          const amountInBase = convertCurrency(rev.amount, rev.currency, baseCurrency, exchangeRates);
                          let monthlyBase = amountInBase;
                          if (rev.frequency === 'yearly') monthlyBase = amountInBase / 12;
                          else if (rev.frequency === 'quarterly') monthlyBase = amountInBase / 3;

                          return (
                            <tr key={rev.id}>
                              <td>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{rev.clientName}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.notes}</span>
                              </td>
                              <td>
                                <span className="pill-badge pill-badge-muted" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                                  {rev.revenueType.replace('_', ' ').toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                                  {rev.frequency.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 800, color: 'var(--color-success-text)' }}>
                                  {formatMoney(rev.amount, rev.currency)}
                                </div>
                                {rev.frequency !== 'monthly' && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {formatMoney(monthlyBase)}/mo eq.
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {rev.startDate} to {rev.endDate || 'Ongoing'}
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: rev.status === 'active' ? 'var(--color-success-text)' : rev.status === 'paused' ? '#F59E0B' : 'var(--color-risk-text)'
                                }}>
                                  {rev.status.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <button className="circle-btn" style={{ color: 'var(--color-risk)' }} onClick={() => deleteRecurringRevenue(rev.id)}>
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB: EXPENSES */}
          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recurring Expense Management</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Track payroll, hosting, AI API costs, and compliance expenditures.</p>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Total Monthly Spend: <span style={{ color: 'var(--color-risk)' }}>{formatMoney(metrics.totalRecurringExpenseMonth)}</span>
                </div>
              </div>

              {/* Add Expense Form */}
              <section className="card-premium">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--color-risk)' }} />
                  <span>Configure Recurring Expense Contract</span>
                </h3>
                                <div className="form-container-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expense Name</label>
                        <input className="input-premium" type="text" value={expenseForm.expenseName} onChange={e => setExpenseForm({ ...expenseForm, expenseName: e.target.value })} placeholder="Vendor / Service Name" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                        <PremiumSelect className="input-premium" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}>
                          <option value="payroll">Payroll</option>
                          <option value="hosting">Hosting</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="ai_tools">AI Tools</option>
                          <option value="software_licenses">Software Licenses</option>
                          <option value="internet">Internet</option>
                          <option value="rent">Rent</option>
                          <option value="compliance">Compliance</option>
                          <option value="operations">Operations</option>
                          <option value="other">Other</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Cost</label>
                        <input className="input-premium" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency</label>
                        <PremiumSelect className="input-premium" value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="AED">AED (AED)</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Frequency</label>
                        <PremiumSelect className="input-premium" value={expenseForm.frequency} onChange={e => setExpenseForm({ ...expenseForm, frequency: e.target.value as any })}>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</label>
                        <input className="input-premium" type="date" value={expenseForm.startDate} onChange={e => setExpenseForm({ ...expenseForm, startDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>End Date</label>
                        <input className="input-premium" type="date" value={expenseForm.endDate} onChange={e => setExpenseForm({ ...expenseForm, endDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Forecast Impact</label>
                        <PremiumSelect className="input-premium" value={expenseForm.forecastImpact} onChange={e => setExpenseForm({ ...expenseForm, forecastImpact: e.target.value as any })}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                        <PremiumSelect className="input-premium" value={expenseForm.status} onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value as any })}>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="ended">Ended</option>
                        </PremiumSelect>
                      </div>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ gridColumn: '1 / -1', justifySelf: 'end', marginTop: '10px', backgroundColor: 'var(--color-risk)', boxShadow: '0 4px 12px rgba(255, 138, 101, 0.2)' }}
                        onClick={() => {
                          if (!expenseForm.expenseName) {
                            alert('Please enter an expense name.');
                            return;
                          }
                          addRecurringExpense(expenseForm);
                          setExpenseForm({
                            expenseName: '',
                            category: 'hosting',
                            amount: 10000,
                            currency: baseCurrency,
                            frequency: 'monthly',
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: '',
                            status: 'active',
                            forecastImpact: 'medium'
                          });
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Recurring Expense</span>
                      </button>
                    </div>
              </section>

              {/* Expense list table */}
              <section className="card-premium" style={{ padding: '24px 0' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Monthly Spend</th>
                        <th>Forecast Impact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurringExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No active recurring expenses registered.
                          </td>
                        </tr>
                      ) : (
                        recurringExpenses.map((exp) => {
                          const amountInBase = convertCurrency(exp.amount, exp.currency, baseCurrency, exchangeRates);
                          let monthlyBase = amountInBase;
                          if (exp.frequency === 'yearly') monthlyBase = amountInBase / 12;
                          else if (exp.frequency === 'quarterly') monthlyBase = amountInBase / 3;

                          return (
                            <tr key={exp.id}>
                              <td>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{exp.expenseName}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.startDate} to {exp.endDate || 'Ongoing'}</span>
                              </td>
                              <td>
                                <span className="pill-badge pill-badge-muted" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                                  {exp.category.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 800, color: 'var(--color-risk-text)' }}>
                                  {formatMoney(exp.amount, exp.currency)}
                                </div>
                                {exp.frequency !== 'monthly' && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {formatMoney(monthlyBase)}/mo eq.
                                  </span>
                                )}
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: exp.forecastImpact === 'high' ? 'var(--color-risk-text)' : exp.forecastImpact === 'medium' ? '#F59E0B' : 'var(--color-success-text)'
                                }}>
                                  {exp.forecastImpact.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: exp.status === 'active' ? 'var(--color-success-text)' : exp.status === 'paused' ? '#F59E0B' : 'var(--color-risk-text)'
                                }}>
                                  {exp.status.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <button className="circle-btn" style={{ color: 'var(--color-risk)' }} onClick={() => deleteRecurringExpense(exp.id)}>
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB: RECEIVABLES */}
          {activeTab === 'receivables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Accounts Receivable</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Monitor money expected from clients, track overdue invoices, and evaluate collection risks.</p>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Total Outstanding: <span style={{ color: 'var(--color-primary)' }}>{formatMoney(metrics.totalOutstandingReceivables)}</span>
                </div>
              </div>

              {/* Add Receivable Form */}
              <section className="card-premium">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>Log Client Invoice (Receivable)</span>
                </h3>
                                <div className="form-container-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Client Name</label>
                        <input className="input-premium" type="text" value={receivableForm.client} onChange={e => setReceivableForm({ ...receivableForm, client: e.target.value })} placeholder="Client" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Invoice #</label>
                        <input className="input-premium" type="text" value={receivableForm.invoice} onChange={e => setReceivableForm({ ...receivableForm, invoice: e.target.value })} placeholder="e.g. INV-2026-004" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Invoice Amount</label>
                        <input className="input-premium" type="number" value={receivableForm.amount} onChange={e => setReceivableForm({ ...receivableForm, amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency</label>
                        <PremiumSelect className="input-premium" value={receivableForm.currency} onChange={e => setReceivableForm({ ...receivableForm, currency: e.target.value })}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="AED">AED (AED)</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Due Date</label>
                        <input className="input-premium" type="date" value={receivableForm.dueDate} onChange={e => setReceivableForm({ ...receivableForm, dueDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Collection Risk</label>
                        <PremiumSelect className="input-premium" value={receivableForm.collectionRisk} onChange={e => setReceivableForm({ ...receivableForm, collectionRisk: e.target.value as any })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                        <PremiumSelect className="input-premium" value={receivableForm.status} onChange={e => setReceivableForm({ ...receivableForm, status: e.target.value as any })}>
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </PremiumSelect>
                      </div>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ gridColumn: '1 / -1', justifySelf: 'end', marginTop: '10px' }}
                        onClick={() => {
                          if (!receivableForm.client || !receivableForm.invoice) {
                            alert('Please complete the client and invoice fields.');
                            return;
                          }
                          // Compute outstanding days
                          const diffTime = new Date().getTime() - new Date(receivableForm.dueDate).getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          const daysOutstanding = diffDays > 0 ? diffDays : 0;
                          
                          addReceivable({ ...receivableForm, daysOutstanding });
                          setReceivableForm({
                            client: '',
                            invoice: '',
                            amount: 50000,
                            currency: baseCurrency,
                            dueDate: new Date().toISOString().split('T')[0],
                            status: 'unpaid',
                            daysOutstanding: 0,
                            collectionRisk: 'low'
                          });
                        }}
                      >
                        <Plus size={16} />
                        <span>Log Receivable</span>
                      </button>
                    </div>
              </section>

              {/* Receivables List */}
              <section className="card-premium" style={{ padding: '24px 0' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Client / Invoice</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Days Outstanding</th>
                        <th>Collection Risk</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivables.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No outstanding accounts receivable found.
                          </td>
                        </tr>
                      ) : (
                        receivables.map((rec) => {
                          return (
                            <tr key={rec.id}>
                              <td>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{rec.client}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice: {rec.invoice}</span>
                              </td>
                              <td style={{ fontWeight: 800 }}>
                                {formatMoney(rec.amount, rec.currency)}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {formatDate(rec.dueDate)}
                              </td>
                              <td style={{ fontWeight: 700, color: rec.daysOutstanding > 0 ? 'var(--color-risk-text)' : 'var(--text-muted)' }}>
                                {rec.daysOutstanding} days
                              </td>
                              <td>
                                <span className={`pill-badge ${rec.collectionRisk === 'high' ? 'pill-badge-risk' : rec.collectionRisk === 'medium' ? 'pill-badge-muted' : 'pill-badge-success'}`} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                                  {rec.collectionRisk.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <PremiumSelect
                                  value={rec.status}
                                  onChange={e => {
                                    updateReceivable(rec.id, { status: e.target.value as any });
                                    recompute();
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: rec.status === 'paid' ? 'var(--color-success-text)' : rec.status === 'overdue' ? 'var(--color-risk-text)' : '#F59E0B'
                                  }}
                                >
                                  <option value="unpaid">UNPAID</option>
                                  <option value="paid">PAID</option>
                                  <option value="overdue">OVERDUE</option>
                                </PremiumSelect>
                              </td>
                              <td>
                                <button className="circle-btn" style={{ color: 'var(--color-risk)' }} onClick={() => deleteReceivable(rec.id)}>
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB: PAYABLES */}
          {activeTab === 'payables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Accounts Payable</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Track liabilities, manage vendor invoices, and prioritize upcoming outgoing cash commitments.</p>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Total Outstanding: <span style={{ color: 'var(--color-risk)' }}>{formatMoney(metrics.totalOutstandingPayables)}</span>
                </div>
              </div>

              {/* Add Payable Form */}
              <section className="card-premium">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--color-risk)' }} />
                  <span>Log Vendor Invoice (Payable)</span>
                </h3>
                                <div className="form-container-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vendor</label>
                        <input className="input-premium" type="text" value={payableForm.vendor} onChange={e => setPayableForm({ ...payableForm, vendor: e.target.value })} placeholder="Vendor / Supplier" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expense description</label>
                        <input className="input-premium" type="text" value={payableForm.expense} onChange={e => setPayableForm({ ...payableForm, expense: e.target.value })} placeholder="e.g. Hosting billing" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount Owed</label>
                        <input className="input-premium" type="number" value={payableForm.amount} onChange={e => setPayableForm({ ...payableForm, amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency</label>
                        <PremiumSelect className="input-premium" value={payableForm.currency} onChange={e => setPayableForm({ ...payableForm, currency: e.target.value })}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="AED">AED (AED)</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Due Date</label>
                        <input className="input-premium" type="date" value={payableForm.dueDate} onChange={e => setPayableForm({ ...payableForm, dueDate: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</label>
                        <PremiumSelect className="input-premium" value={payableForm.priority} onChange={e => setPayableForm({ ...payableForm, priority: e.target.value as any })}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </PremiumSelect>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                        <PremiumSelect className="input-premium" value={payableForm.status} onChange={e => setPayableForm({ ...payableForm, status: e.target.value as any })}>
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </PremiumSelect>
                      </div>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ gridColumn: '1 / -1', justifySelf: 'end', marginTop: '10px', backgroundColor: 'var(--color-risk)', boxShadow: '0 4px 12px rgba(255, 138, 101, 0.2)' }}
                        onClick={() => {
                          if (!payableForm.vendor || !payableForm.expense) {
                            alert('Please complete the vendor and description fields.');
                            return;
                          }
                          addPayable(payableForm);
                          setPayableForm({
                            vendor: '',
                            expense: '',
                            amount: 20000,
                            currency: baseCurrency,
                            dueDate: new Date().toISOString().split('T')[0],
                            status: 'unpaid',
                            priority: 'medium'
                          });
                        }}
                      >
                        <Plus size={16} />
                        <span>Log Payable</span>
                      </button>
                    </div>
              </section>

              {/* Payables List */}
              <section className="card-premium" style={{ padding: '24px 0' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Vendor / Expense</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payables.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No outstanding accounts payable found.
                          </td>
                        </tr>
                      ) : (
                        payables.map((pay) => {
                          return (
                            <tr key={pay.id}>
                              <td>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{pay.vendor}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description: {pay.expense}</span>
                              </td>
                              <td style={{ fontWeight: 800 }}>
                                {formatMoney(pay.amount, pay.currency)}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {formatDate(pay.dueDate)}
                              </td>
                              <td>
                                <span className={`pill-badge ${pay.priority === 'high' ? 'pill-badge-risk' : pay.priority === 'medium' ? 'pill-badge-muted' : 'pill-badge-success'}`} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                                  {pay.priority.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <PremiumSelect
                                  value={pay.status}
                                  onChange={e => {
                                    updatePayable(pay.id, { status: e.target.value as any });
                                    recompute();
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: pay.status === 'paid' ? 'var(--color-success-text)' : '#F59E0B'
                                  }}
                                >
                                  <option value="unpaid">UNPAID</option>
                                  <option value="paid">PAID</option>
                                </PremiumSelect>
                              </td>
                              <td>
                                <button className="circle-btn" style={{ color: 'var(--color-risk)' }} onClick={() => deletePayable(pay.id)}>
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB: INVOICES (NEW MODULE) */}
          {activeTab === 'invoices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="no-print">
              
              {/* PAGE HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Invoice Management</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Create, manage, track and export customer invoices.</p>
                </div>
                {invoiceViewMode === 'list' ? (
                  <button
                    className="btn-pill btn-pill-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontWeight: 700 }}
                    onClick={() => {
                      setInvoiceViewMode('create');
                      setInvoiceForm(defaultInvoiceForm);
                    }}
                  >
                    <Plus size={16} />
                    <span>Create Invoice</span>
                  </button>
                ) : (
                  <button
                    className="btn-pill btn-pill-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontWeight: 700 }}
                    onClick={() => setInvoiceViewMode('list')}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Invoices</span>
                  </button>
                )}
              </div>

              {/* VIEW 1: INVOICES LISTING SCREEN */}
              {invoiceViewMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* TOP ACTION BAR & FILTERS */}
                  <div className="card-premium" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                      
                      {/* Left: Search */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 250px', maxWidth: '400px' }}>
                        <div className="header-search" style={{ width: '100%', border: '1px solid var(--border-medium)', borderRadius: '8px' }}>
                          <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                          <input 
                            placeholder="Search invoice #, client, project..." 
                            type="text" 
                            value={invoiceSearchQuery}
                            onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                            style={{ fontSize: '0.82rem', height: '24px' }}
                          />
                        </div>
                      </div>

                      {/* Right: Filters */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        
                        {/* Status Filter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</span>
                          <PremiumSelect
                            value={invoiceStatusFilter}
                            onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                            className="input-premium"
                            style={{ height: '30px', fontSize: '0.75rem', minWidth: '100px', padding: '0 8px' }}
                          >
                            <option value="all">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </PremiumSelect>
                        </div>

                        {/* Date Range Filter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date Range</span>
                          <PremiumSelect
                            value={invoiceDateFilter}
                            onChange={(e) => setInvoiceDateFilter(e.target.value)}
                            className="input-premium"
                            style={{ height: '30px', fontSize: '0.75rem', minWidth: '110px', padding: '0 8px' }}
                          >
                            <option value="all">All Dates</option>
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="Quarter">Quarter</option>
                            <option value="Year">Year</option>
                          </PremiumSelect>
                        </div>

                        {/* Client Filter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client</span>
                          <PremiumSelect
                            value={invoiceClientFilter}
                            onChange={(e) => setInvoiceClientFilter(e.target.value)}
                            className="input-premium"
                            style={{ height: '30px', fontSize: '0.75rem', minWidth: '110px', padding: '0 8px' }}
                          >
                            <option value="all">All Clients</option>
                            {uniqueInvoiceClients.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </PremiumSelect>
                        </div>

                        {/* Amount Filter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount</span>
                          <PremiumSelect
                            value={invoiceAmountFilter}
                            onChange={(e) => setInvoiceAmountFilter(e.target.value)}
                            className="input-premium"
                            style={{ height: '30px', fontSize: '0.75rem', minWidth: '100px', padding: '0 8px' }}
                          >
                            <option value="all">All Amounts</option>
                            <option value="under_10k">Under ₹10k</option>
                            <option value="10k_100k">₹10k - ₹100k</option>
                            <option value="over_100k">Over ₹100k</option>
                          </PremiumSelect>
                        </div>

                        {/* Clear Trigger */}
                        {(invoiceSearchQuery || invoiceStatusFilter !== 'all' || invoiceDateFilter !== 'all' || invoiceClientFilter !== 'all' || invoiceAmountFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setInvoiceSearchQuery('');
                              setInvoiceStatusFilter('all');
                              setInvoiceDateFilter('all');
                              setInvoiceClientFilter('all');
                              setInvoiceAmountFilter('all');
                            }}
                            className="btn-pill btn-pill-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '16px', height: '30px' }}
                          >
                            Clear
                          </button>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* INVOICE KPI STRIP */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '90px', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Invoices</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatMoney(invoiceKPIs.totalInvoices)}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Count: {invoiceKPIs.totalCount} active</span>
                    </div>
                    <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '90px', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Paid Invoices</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success-text)' }}>{formatMoney(invoiceKPIs.paidInvoices)}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Received from clients</span>
                    </div>
                    <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '90px', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Collection</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatMoney(invoiceKPIs.pendingCollection)}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Sent + Partial + Overdue</span>
                    </div>
                    <div className="card-premium" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '90px', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overdue Amount</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-risk-text)' }}>{formatMoney(invoiceKPIs.overdueAmount)}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-risk-text)', fontWeight: 600 }}>Needs collection call</span>
                    </div>
                  </div>

                  {/* INVOICE TABLE */}
                  <section className="card-premium" style={{ padding: '24px 0' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table-premium">
                        <thead>
                          <tr>
                            <th>Invoice Number</th>
                            <th>Client</th>
                            <th>Project</th>
                            <th>Invoice Date</th>
                            <th>Due Date</th>
                            <th>Amount</th>
                            <th>Paid</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                No invoices match the filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredInvoices.map((inv) => {
                              const paidAmt = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
                              const balance = inv.totalAmount - paidAmt;
                              
                              let badgeColor = '';
                              let textColor = '';
                              if (inv.status === 'Paid') { badgeColor = 'var(--color-success-light)'; textColor = 'var(--color-success-text)'; }
                              else if (inv.status === 'Draft') { badgeColor = 'var(--border-medium)'; textColor = 'var(--text-secondary)'; }
                              else if (inv.status === 'Sent') { badgeColor = 'rgba(79, 124, 255, 0.1)'; textColor = 'var(--color-primary)'; }
                              else if (inv.status === 'Partial') { badgeColor = 'rgba(245, 158, 11, 0.1)'; textColor = '#d97706'; }
                              else if (inv.status === 'Overdue') { badgeColor = 'var(--color-risk-light)'; textColor = 'var(--color-risk-text)'; }
                              else if (inv.status === 'Cancelled') { badgeColor = 'rgba(148, 163, 184, 0.1)'; textColor = '#64748b'; }

                              return (
                                <tr key={inv.id}>
                                  <td>
                                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{inv.id}</div>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{inv.currency}</span>
                                  </td>
                                  <td>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{inv.clientName}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.projectName || '—'}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.invoiceDate}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: (inv.status !== 'Paid' && inv.status !== 'Draft' && inv.dueDate < '2026-06-07') ? 'var(--color-risk-text)' : 'var(--text-secondary)' }}>{inv.dueDate}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{formatMoney(inv.totalAmount, inv.currency)}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--color-success-text)' }}>{formatMoney(paidAmt, inv.currency)}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: balance > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{formatMoney(balance, inv.currency)}</div>
                                  </td>
                                  <td>
                                    <span className="pill-badge" style={{ backgroundColor: badgeColor, color: textColor, padding: '3px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
                                      {inv.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      
                                      <button 
                                        className="circle-btn" 
                                        style={{ width: '28px', height: '28px' }} 
                                        title="View Invoice Details"
                                        onClick={() => {
                                          setSelectedInvoiceId(inv.id);
                                          setInvoiceViewMode('view');
                                        }}
                                      >
                                        <Eye size={12} />
                                      </button>
                                      
                                      <button 
                                        className="circle-btn" 
                                        style={{ width: '28px', height: '28px' }}
                                        title="Edit Invoice"
                                        onClick={() => {
                                          setSelectedInvoiceId(inv.id);
                                          setInvoiceViewMode('edit');
                                          populateInvoiceForm(inv);
                                        }}
                                      >
                                        <Edit size={12} />
                                      </button>

                                      <button 
                                        className="circle-btn" 
                                        style={{ width: '28px', height: '28px' }}
                                        title="Duplicate"
                                        onClick={() => duplicateInvoice(inv)}
                                      >
                                        <Copy size={12} />
                                      </button>

                                      <button 
                                        className="circle-btn" 
                                        style={{ width: '28px', height: '28px' }}
                                        title="Print"
                                        onClick={() => {
                                          setSelectedInvoiceId(inv.id);
                                          setTimeout(() => {
                                            window.print();
                                          }, 200);
                                        }}
                                      >
                                        <Printer size={12} />
                                      </button>

                                      <button 
                                        className="circle-btn" 
                                        style={{ width: '28px', height: '28px', color: 'var(--color-risk)' }}
                                        title="Delete"
                                        onClick={() => deleteInvoice(inv)}
                                      >
                                        <Trash size={12} />
                                      </button>

                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW 2: CREATE / EDIT INVOICE SCREEN */}
              {(invoiceViewMode === 'create' || invoiceViewMode === 'edit') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                  
                  {/* Left: Form Editor */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Import estimate banner if available */}
                    {savedEstimates.length > 0 && (
                      <section className="card-premium" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={14} />
                            <span>Quick Import: Convert from Project Estimate</span>
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select a saved project estimate to pre-populate billing and line items automatically.</p>
                          
                          <div style={{ width: '100%', maxWidth: '400px', marginTop: '6px' }}>
                            <PremiumSelect
                              value=""
                              onChange={(e) => {
                                const estId = e.target.value;
                                const est = savedEstimates.find(s => s.id === estId);
                                if (est) {
                                  setInvoiceForm(current => ({
                                    ...current,
                                    clientName: est.clientName,
                                    clientEmail: est.clientName.toLowerCase().replace(/\s+/g, '') + '@company.com',
                                    companyName: est.clientName,
                                    billingAddress: est.clientRegion + ' Corporate Office',
                                    items: [
                                      { 
                                        id: '1', 
                                        description: `Project implementation estimate for ${est.projectName}`, 
                                        qty: 1, 
                                        rate: est.recommendedQuote, 
                                        taxPercent: 18,
                                        amount: est.recommendedQuote * 1.18 
                                      }
                                    ],
                                    subtotal: est.recommendedQuote,
                                    taxAmount: est.recommendedQuote * 0.18,
                                    totalAmount: est.recommendedQuote * 1.18,
                                    dueAmount: est.recommendedQuote * 1.18,
                                    internalNotes: `Converted from Saved Estimate Scenario: ${est.projectName}`,
                                    projectName: est.projectName
                                  }));
                                  alert(`Imported project estimate: "${est.projectName}"`);
                                }
                              }}
                              className="input-premium"
                              style={{ height: '32px', fontSize: '0.8rem' }}
                            >
                              <option value="">-- Select Saved Estimate to Convert --</option>
                              {savedEstimates.map(est => (
                                <option key={est.id} value={est.id}>{est.projectName} ({est.clientName} - {formatMoney(est.recommendedQuote)})</option>
                              ))}
                            </PremiumSelect>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Section 1: Client Details */}
                    <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
                        Client Details
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Client Name</label>
                            <button
                              type="button"
                              onClick={() => {
                                setEnterInvoiceClientManually(!enterInvoiceClientManually);
                                setInvoiceForm(curr => ({ ...curr, clientName: '', clientEmail: '', companyName: '', billingAddress: '', gstTaxId: '' }));
                              }}
                              style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                              {enterInvoiceClientManually ? "Select from Directory" : "Enter Manually"}
                            </button>
                          </div>
                          {enterInvoiceClientManually ? (
                            <input
                              className="input-premium"
                              type="text"
                              value={invoiceForm.clientName}
                              onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                              placeholder="e.g. Acme Corp"
                            />
                          ) : (
                            <PremiumSelect
                              value={invoiceForm.clientName}
                              onChange={e => {
                                const selectedName = e.target.value;
                                if (selectedName === 'MANUAL_ENTRY') {
                                  setEnterInvoiceClientManually(true);
                                  setInvoiceForm(curr => ({ ...curr, clientName: '', clientEmail: '', companyName: '', billingAddress: '', gstTaxId: '' }));
                                } else {
                                  const cust = customers.find(c => c.name === selectedName);
                                  if (cust) {
                                    setInvoiceForm({
                                      ...invoiceForm,
                                      clientName: cust.name,
                                      clientEmail: cust.email,
                                      companyName: cust.companyName,
                                      billingAddress: `${cust.address}, ${cust.city}, ${cust.state}, ${cust.country} ${cust.postalCode}`.trim().replace(/^,\s*|,\s*$/g, '').replace(/\s+/g, ' '),
                                      gstTaxId: cust.gstNumber || cust.taxId,
                                      currency: cust.currency,
                                      paymentTerms: cust.paymentTerms
                                    });
                                  } else {
                                    setInvoiceForm({ ...invoiceForm, clientName: selectedName });
                                  }
                                }
                              }}
                              className="input-premium"
                              style={{ height: '42px', padding: '0 20px' }}
                            >
                              <option value="">-- Select Customer --</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.companyName})</option>
                              ))}
                              <option value="MANUAL_ENTRY">-- Enter Manually / Custom --</option>
                            </PremiumSelect>
                          )}
                        </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Client Email</label>
                          <input 
                            className="input-premium" 
                            type="email" 
                            value={invoiceForm.clientEmail} 
                            onChange={e => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                            placeholder="e.g. billing@client.com" 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Company Name</label>
                          <input 
                            className="input-premium" 
                            type="text" 
                            value={invoiceForm.companyName} 
                            onChange={e => setInvoiceForm({ ...invoiceForm, companyName: e.target.value })}
                            placeholder="e.g. Acme Corporation" 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>GST / Tax ID</label>
                          <input 
                            className="input-premium" 
                            type="text" 
                            value={invoiceForm.gstTaxId} 
                            onChange={e => setInvoiceForm({ ...invoiceForm, gstTaxId: e.target.value })}
                            placeholder="e.g. 27AAAAA1111A1Z1" 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Billing Address</label>
                          <input 
                            className="input-premium" 
                            type="text" 
                            value={invoiceForm.billingAddress} 
                            onChange={e => setInvoiceForm({ ...invoiceForm, billingAddress: e.target.value })}
                            placeholder="Full billing address" 
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Currency</label>
                          <PremiumSelect
                            value={invoiceForm.currency}
                            onChange={e => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
                            className="input-premium"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="AED">AED (AED)</option>
                          </PremiumSelect>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Associated Project Name (Optional)</label>
                          <input 
                            className="input-premium" 
                            type="text" 
                            value={invoiceForm.projectName || ''} 
                            onChange={e => setInvoiceForm({ ...invoiceForm, projectName: e.target.value })}
                            placeholder="e.g. Cloud Migration Platform" 
                          />
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Invoice Details */}
                    <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
                        Invoice Details
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Invoice Number</label>
                          <input 
                            className="input-premium" 
                            type="text" 
                            value={invoiceForm.id || 'INV-2026-xxx (Auto-generated)'} 
                            disabled 
                            style={{ backgroundColor: 'var(--border-light)', cursor: 'not-allowed' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Invoice Date</label>
                          <input 
                            className="input-premium" 
                            type="date" 
                            value={invoiceForm.invoiceDate} 
                            onChange={e => {
                              const newDate = e.target.value;
                              let days = 15;
                              if (invoiceForm.paymentTerms === 'Net 30') days = 30;
                              else if (invoiceForm.paymentTerms === 'Net 45') days = 45;
                              
                              let newDueDate = invoiceForm.dueDate;
                              if (invoiceForm.paymentTerms !== 'Custom' && newDate) {
                                newDueDate = new Date(new Date(newDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                              }
                              setInvoiceForm({ ...invoiceForm, invoiceDate: newDate, dueDate: newDueDate });
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Terms</label>
                          <PremiumSelect
                            value={invoiceForm.paymentTerms}
                            onChange={e => {
                              const terms = e.target.value;
                              let days = 15;
                              if (terms === 'Net 30') days = 30;
                              else if (terms === 'Net 45') days = 45;

                              let newDueDate = invoiceForm.dueDate;
                              if (terms !== 'Custom' && invoiceForm.invoiceDate) {
                                newDueDate = new Date(new Date(invoiceForm.invoiceDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                              }
                              setInvoiceForm({ ...invoiceForm, paymentTerms: terms, dueDate: newDueDate });
                            }}
                            className="input-premium"
                          >
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Custom">Custom</option>
                          </PremiumSelect>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Due Date</label>
                          <input 
                            className="input-premium" 
                            type="date" 
                            value={invoiceForm.dueDate} 
                            disabled={invoiceForm.paymentTerms !== 'Custom'}
                            style={invoiceForm.paymentTerms !== 'Custom' ? { backgroundColor: 'var(--border-light)', cursor: 'not-allowed' } : undefined}
                            onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Section 3: Line Items */}
                    <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Line Items</span>
                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                          onClick={addInvoiceFormItem}
                        >
                          + Add Item
                        </button>
                      </h3>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                              <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Description</th>
                              <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '70px', textAlign: 'center' }}>Qty</th>
                              <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '110px', textAlign: 'right' }}>Rate</th>
                              <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '80px', textAlign: 'center' }}>Tax %</th>
                              <th style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '110px', textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '8px', width: '40px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceForm.items.map((item, idx) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '6px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="text" 
                                    value={item.description}
                                    onChange={(e) => handleInvoiceFormItemChange(idx, 'description', e.target.value)}
                                    placeholder="Description of services..."
                                    style={{ fontSize: '0.8rem', padding: '6px' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="number" 
                                    value={item.qty}
                                    onChange={(e) => handleInvoiceFormItemChange(idx, 'qty', parseInt(e.target.value) || 0)}
                                    style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'center' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="number" 
                                    value={item.rate}
                                    onChange={(e) => handleInvoiceFormItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                    style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'right' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input 
                                    className="input-premium" 
                                    type="number" 
                                    value={item.taxPercent}
                                    onChange={(e) => handleInvoiceFormItemChange(idx, 'taxPercent', parseFloat(e.target.value) || 0)}
                                    style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'center' }}
                                  />
                                </td>
                                <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                  {formatMoney(item.amount, invoiceForm.currency)}
                                </td>
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                  <button 
                                    className="circle-btn" 
                                    style={{ color: 'var(--color-risk)', width: '24px', height: '24px', opacity: invoiceForm.items.length <= 1 ? 0.4 : 1 }}
                                    disabled={invoiceForm.items.length <= 1}
                                    onClick={() => removeInvoiceFormItem(idx)}
                                  >
                                    <Trash size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 4 & 5: Summary & Notes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
                      
                      {/* Notes Section */}
                      <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Terms & Conditions</label>
                          <textarea 
                            className="input-premium" 
                            rows={3}
                            value={invoiceForm.termsAndConditions}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, termsAndConditions: e.target.value })}
                            style={{ fontSize: '0.78rem', padding: '8px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Customer Notes (Visible on Invoice)</label>
                          <textarea 
                            className="input-premium" 
                            rows={2}
                            value={invoiceForm.customerNotes}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, customerNotes: e.target.value })}
                            style={{ fontSize: '0.78rem', padding: '8px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Internal Notes (Staff Only)</label>
                          <textarea 
                            className="input-premium" 
                            rows={2}
                            value={invoiceForm.internalNotes}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, internalNotes: e.target.value })}
                            style={{ fontSize: '0.78rem', padding: '8px' }}
                          />
                        </div>
                      </section>

                      {/* Summary calculations */}
                      <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px' }}>Invoice Totals</h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>{formatMoney(invoiceForm.subtotal, invoiceForm.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tax Amount</span>
                          <span style={{ fontWeight: 600 }}>{formatMoney(invoiceForm.taxAmount, invoiceForm.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Discount Amount</span>
                            <input 
                              className="input-premium" 
                              type="number" 
                              value={invoiceForm.discount}
                              onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                              style={{ width: '90px', padding: '4px 8px', fontSize: '0.8rem', textAlign: 'right', height: '24px' }}
                            />
                          </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800 }}>
                          <span style={{ color: 'var(--text-primary)' }}>Total Amount</span>
                          <span style={{ color: 'var(--color-primary)' }}>{formatMoney(invoiceForm.totalAmount, invoiceForm.currency)}</span>
                        </div>
                      </section>

                    </div>

                    {/* Form actions save */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        className="btn-pill btn-pill-secondary"
                        style={{ height: '36px', padding: '0 16px', fontWeight: 700 }}
                        onClick={() => setInvoiceViewMode('list')}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-pill btn-pill-secondary"
                        style={{ height: '36px', padding: '0 16px', fontWeight: 700, backgroundColor: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                        onClick={() => handleSaveInvoice('Draft')}
                      >
                        Save Draft
                      </button>
                      <button
                        className="btn-pill btn-pill-primary"
                        style={{ height: '36px', padding: '0 20px', fontWeight: 700 }}
                        onClick={() => handleSaveInvoice('Sent')}
                      >
                        Save & Send
                      </button>
                    </div>

                  </div>

                  {/* Right: Live Invoice Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Live Invoice Preview</h3>
                    
                    <div id="invoice-print-area" className="card-premium" style={{ padding: '20px', boxShadow: 'var(--shadow-floating)', background: '#ffffff', minHeight: '440px', fontSize: '0.72rem', color: '#1e293b', border: '1px solid var(--border-medium)', borderRadius: '12px', position: 'relative' }}>
                      
                      <div style={{ position: 'absolute', top: '55px', right: '20px', border: '3px double var(--text-muted)', color: 'var(--text-muted)', transform: 'rotate(12deg)', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px', letterSpacing: '1px', opacity: 0.7 }}>
                        {invoiceForm.status ? invoiceForm.status.toUpperCase() : 'DRAFT'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.82rem' }}>
                            <Briefcase size={12} />
                            <span>{companyProfile.companyName || 'AURA CORP'}</span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem', marginTop: '2px' }}>{'finance@' + (companyProfile.companyName || 'aura').toLowerCase().replace(/\s+/g, '') + '.com'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>INVOICE</div>
                          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>{invoiceForm.id || 'INV-2026-xxx'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', marginBottom: '3px' }}>Bill To:</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{invoiceForm.clientName || 'Client Name'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{invoiceForm.companyName}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>{invoiceForm.billingAddress || 'No Address Provided'}</div>
                          {invoiceForm.gstTaxId && <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Tax ID: {invoiceForm.gstTaxId}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Date:</span> <strong>{invoiceForm.invoiceDate}</strong></div>
                          <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-muted)' }}>Due Date:</span> <strong style={{ color: 'var(--color-risk-text)' }}>{invoiceForm.dueDate}</strong></div>
                          <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-muted)' }}>Terms:</span> <strong>{invoiceForm.paymentTerms}</strong></div>
                          {invoiceForm.projectName && <div style={{ marginTop: '4px', fontSize: '0.62rem', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Project:</span> <strong>{invoiceForm.projectName}</strong></div>}
                        </div>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '4px' }}>
                          <div style={{ flex: 1 }}>Item Description</div>
                          <div style={{ width: '40px', textAlign: 'center' }}>Qty</div>
                          <div style={{ width: '60px', textAlign: 'right' }}>Amount</div>
                        </div>
                        {invoiceForm.items.map((item, idx) => (
                          <div key={item.id || idx} style={{ display: 'flex', padding: '3px 0', color: 'var(--text-secondary)' }}>
                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description || '(No description)'}</div>
                            <div style={{ width: '40px', textAlign: 'center' }}>{item.qty}</div>
                            <div style={{ width: '60px', textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.amount, invoiceForm.currency)}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '150px', marginLeft: 'auto', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                          <strong>{formatMoney(invoiceForm.subtotal, invoiceForm.currency)}</strong>
                        </div>
                        {invoiceForm.taxAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Tax:</span>
                            <strong>{formatMoney(invoiceForm.taxAmount, invoiceForm.currency)}</strong>
                          </div>
                        )}
                        {invoiceForm.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-risk-text)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Discount:</span>
                            <strong>-{formatMoney(invoiceForm.discount, invoiceForm.currency)}</strong>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '14px' }}>
                        <span>INVOICE TOTAL:</span>
                        <span style={{ color: 'var(--color-primary)' }}>{formatMoney(invoiceForm.totalAmount, invoiceForm.currency)}</span>
                      </div>

                      <div style={{ backgroundColor: 'var(--color-primary-light)', borderRadius: '6px', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-primary)' }}>Live Due Amount</div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '2px' }}>{formatMoney(invoiceForm.totalAmount, invoiceForm.currency)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Due Date</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>{invoiceForm.dueDate}</div>
                        </div>
                      </div>

                      {invoiceForm.customerNotes && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '6px', fontSize: '0.58rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Notes: {invoiceForm.customerNotes}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* VIEW 3: INVOICE DETAILS VIEW PAGE */}
              {invoiceViewMode === 'view' && selectedInvoiceId && (() => {
                const inv = invoices.find(i => i.id === selectedInvoiceId);
                if (!inv) return <div style={{ color: 'var(--color-risk-text)' }}>Invoice not found.</div>;

                const paidAmt = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
                const balance = inv.totalAmount - paidAmt;

                let badgeColor = '';
                let textColor = '';
                if (inv.status === 'Paid') { badgeColor = 'var(--color-success-light)'; textColor = 'var(--color-success-text)'; }
                else if (inv.status === 'Draft') { badgeColor = 'var(--border-medium)'; textColor = 'var(--text-secondary)'; }
                else if (inv.status === 'Sent') { badgeColor = 'rgba(79, 124, 255, 0.1)'; textColor = 'var(--color-primary)'; }
                else if (inv.status === 'Partial') { badgeColor = 'rgba(245, 158, 11, 0.1)'; textColor = '#d97706'; }
                else if (inv.status === 'Overdue') { badgeColor = 'var(--color-risk-light)'; textColor = 'var(--color-risk-text)'; }
                else if (inv.status === 'Cancelled') { badgeColor = 'rgba(148, 163, 184, 0.1)'; textColor = '#64748b'; }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      <div className="card-premium" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => setInvoiceViewMode('list')}
                        >
                          <ArrowLeft size={14} />
                          <span>Back</span>
                        </button>
                        
                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => {
                            setInvoiceViewMode('edit');
                            populateInvoiceForm(inv);
                          }}
                        >
                          <Edit size={14} />
                          <span>Edit Invoice</span>
                        </button>

                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => duplicateInvoice(inv)}
                        >
                          <Copy size={14} />
                          <span>Duplicate</span>
                        </button>

                        <button
                          className="btn-pill btn-pill-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem', marginLeft: 'auto' }}
                          onClick={() => setIsRecordPaymentOpen(true)}
                          disabled={inv.status === 'Paid' || inv.status === 'Cancelled'}
                        >
                          <Wallet size={14} />
                          <span>Record Payment</span>
                        </button>

                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => window.print()}
                        >
                          <Printer size={14} />
                          <span>Print</span>
                        </button>

                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => {
                            alert('Downloading PDF Invoice to system...');
                            window.print();
                          }}
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </button>

                        <button
                          className="btn-pill btn-pill-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                          onClick={() => {
                            alert(`Emailing invoice ${inv.id} to ${inv.clientEmail || 'client'}... (Future-ready integration)`);
                          }}
                        >
                          <Mail size={14} />
                          <span>Email</span>
                        </button>
                      </div>

                      <div 
                        id="invoice-print-area" 
                        className="card-premium" 
                        style={{ padding: '48px', minHeight: '650px', background: '#ffffff', color: '#1e293b', boxShadow: 'var(--shadow-floating)', border: '1px solid var(--border-medium)', borderRadius: '16px', position: 'relative', fontFamily: '"Inter", sans-serif' }}
                      >
                        
                        <div style={{ position: 'absolute', top: '75px', right: '48px', border: `4px double ${textColor}`, color: textColor, transform: 'rotate(14deg)', padding: '6px 20px', fontSize: '1rem', fontWeight: 900, borderRadius: '6px', letterSpacing: '2px', opacity: 0.85 }}>
                          {inv.status.toUpperCase()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-medium)', paddingBottom: '24px', marginBottom: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                              <Briefcase size={20} />
                              <span>{companyProfile.companyName || 'AURA CONSULTING'}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
                              {companyProfile.companyAddress || 'Tech Hub Boulevard, Suite 500'}<br />
                              GSTIN: '27AABCDE1234F1Z9'<br />
                              Email: {'finance@' + (companyProfile.companyName || 'aura').toLowerCase().replace(/\s+/g, '') + '.com'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <h1 style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>INVOICE</h1>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{inv.id}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginBottom: '32px' }}>
                          <div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em', marginBottom: '6px' }}>Bill To:</div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{inv.clientName}</div>
                            {inv.companyName && <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>{inv.companyName}</div>}
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>{inv.billingAddress || 'No Address Specified'}</div>
                            {inv.gstTaxId && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Tax ID: {inv.gstTaxId}</div>}
                            {inv.clientEmail && <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '2px' }}>{inv.clientEmail}</div>}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.82rem', lineHeight: '1.5' }}>
                            <div><span style={{ color: 'var(--text-muted)' }}>Invoice Date:</span> <strong style={{ color: 'var(--text-primary)' }}>{formatDate(inv.invoiceDate)}</strong></div>
                            <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Due Date:</span> <strong style={{ color: 'var(--color-risk-text)' }}>{formatDate(inv.dueDate)}</strong></div>
                            <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Payment Terms:</span> <strong style={{ color: 'var(--text-primary)' }}>{inv.paymentTerms}</strong></div>
                            {inv.projectName && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Project:</span> <strong style={{ color: 'var(--text-primary)' }}>{inv.projectName}</strong></div>}
                          </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                                <th style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--text-primary)' }}>Description of Service</th>
                                <th style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--text-primary)', width: '60px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--text-primary)', width: '110px', textAlign: 'right' }}>Unit Rate</th>
                                <th style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--text-primary)', width: '70px', textAlign: 'center' }}>Tax %</th>
                                <th style={{ padding: '10px 8px', fontWeight: 800, color: 'var(--text-primary)', width: '120px', textAlign: 'right' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((item, idx) => (
                                <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.description || 'Consulting services'}</td>
                                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.qty}</td>
                                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'right' }}>{formatMoney(item.rate, inv.currency)}</td>
                                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.taxPercent}%</td>
                                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{formatMoney(item.amount, inv.currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
                          <div>
                            {inv.customerNotes && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '12px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', borderLeft: '3px solid var(--border-medium)' }}>
                                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Payment Instructions:</strong>
                                {inv.customerNotes}
                              </div>
                            )}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                              <strong>Payment Instructions:</strong> Wire transfer to HDFC Bank Main Branch. Account: 5020001829101, IFSC: HDFC0000123.
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Subtotal</span>
                                <span style={{ fontWeight: 700 }}>{formatMoney(inv.subtotal, inv.currency)}</span>
                              </div>
                              {inv.taxAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Service Tax (GST)</span>
                                  <span style={{ fontWeight: 700 }}>{formatMoney(inv.taxAmount, inv.currency)}</span>
                                </div>
                              )}
                              {inv.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-risk-text)' }}>
                                  <span style={{ fontWeight: 500 }}>Discount Apply</span>
                                  <span style={{ fontWeight: 700 }}>-{formatMoney(inv.discount, inv.currency)}</span>
                                </div>
                              )}
                              <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900 }}>
                                <span style={{ color: 'var(--text-primary)' }}>Total Amount</span>
                                <span style={{ color: 'var(--color-primary)' }}>{formatMoney(inv.totalAmount, inv.currency)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '48px', borderTop: '1px solid var(--border-medium)', paddingTop: '16px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          <strong>Terms & Conditions:</strong><br />
                          {inv.termsAndConditions || 'Payment is due within payment terms. Late payments are subject to a 1.5% penalty charge.'}
                        </div>

                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      <div className="card-premium" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Invoice Status Summary</h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Status:</span>
                          <span className="pill-badge" style={{ backgroundColor: badgeColor, color: textColor, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 800 }}>
                            {inv.status.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Outstanding Balance</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: balance > 0 ? 'var(--color-primary)' : 'var(--color-success-text)', marginTop: '4px' }}>
                            {formatMoney(balance, inv.currency)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', backgroundColor: 'var(--bg-canvas)', padding: '10px', borderRadius: '8px' }}>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Total Billed:</span> <strong>{formatMoney(inv.totalAmount, inv.currency)}</strong></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Total Paid:</span> <strong style={{ color: 'var(--color-success-text)' }}>{formatMoney(paidAmt, inv.currency)}</strong></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Due Date:</span> <strong style={{ color: inv.dueDate < '2026-06-07' && balance > 0 ? 'var(--color-risk-text)' : 'inherit' }}>{inv.dueDate}</strong></div>
                        </div>
                      </div>

                      <div className="card-premium" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px' }}>Payments History</h4>
                        {inv.payments.length === 0 ? (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                            No payments recorded yet for this invoice.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {inv.payments.map((p, idx) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '8px', borderBottom: idx < inv.payments.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700 }}>
                                  <span style={{ color: 'var(--text-primary)' }}>{formatMoney(p.amountReceived, inv.currency)}</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>{p.paymentDate}</span>
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                  Ref: {p.referenceNumber}
                                </div>
                                {p.notes && <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>"{p.notes}"</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })()}

              {/* RECORD PAYMENT MODAL OVERLAY */}
              {isRecordPaymentOpen && selectedInvoiceId && (() => {
                const inv = invoices.find(i => i.id === selectedInvoiceId);
                if (!inv) return null;
                const paidAmt = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
                const maxReceive = inv.totalAmount - paidAmt;
                
                return (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div className="card-premium" style={{ width: '400px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button 
                        onClick={() => setIsRecordPaymentOpen(false)}
                        style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <X size={18} />
                      </button>
                      
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={18} style={{ color: 'var(--color-primary)' }} />
                        <span>Record Customer Payment</span>
                      </h3>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px' }}>
                        Invoice: <strong>{inv.id}</strong> ({inv.clientName})<br />
                        Remaining Balance: <strong>{formatMoney(maxReceive, inv.currency)}</strong>
                      </div>

                      <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Date</label>
                          <input 
                            className="input-premium"
                            type="date"
                            required
                            value={paymentForm.paymentDate}
                            onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount Received ({inv.currency})</label>
                          <input 
                            className="input-premium"
                            type="number"
                            required
                            min={0.01}
                            max={maxReceive}
                            step="any"
                            value={paymentForm.amountReceived === 0 ? '' : paymentForm.amountReceived}
                            onChange={e => setPaymentForm({ ...paymentForm, amountReceived: parseFloat(e.target.value) || 0 })}
                            placeholder={`Max: ${maxReceive}`}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Reference / Transaction #</label>
                          <input 
                            className="input-premium"
                            type="text"
                            value={paymentForm.referenceNumber}
                            onChange={e => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                            placeholder="e.g. TXN-1082931"
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
                          <input 
                            className="input-premium"
                            type="text"
                            value={paymentForm.notes}
                            onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            placeholder="e.g. Cheque clearance / wire confirmation"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button
                            type="button"
                            className="btn-pill btn-pill-secondary"
                            onClick={() => setIsRecordPaymentOpen(false)}
                            style={{ height: '32px', padding: '0 12px', fontSize: '0.78rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-pill btn-pill-primary"
                            style={{ height: '32px', padding: '0 16px', fontSize: '0.78rem' }}
                          >
                            Record Payment
                          </button>
                        </div>

                      </form>

                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB: CUSTOMERS (NEW MODULE) */}
          {activeTab === 'customers' && (() => {
            // 1. Data queries
            const filteredCustomers = customers.filter(cust => {
              if (customerSearchQuery) {
                const q = customerSearchQuery.toLowerCase();
                const matchName = cust.name.toLowerCase().includes(q);
                const matchCompany = cust.companyName.toLowerCase().includes(q);
                const matchEmail = cust.email.toLowerCase().includes(q);
                const matchPhone = cust.phone.toLowerCase().includes(q) || cust.mobile.toLowerCase().includes(q);
                if (!matchName && !matchCompany && !matchEmail && !matchPhone) return false;
              }
              if (customerStatusFilter !== 'all' && cust.status !== customerStatusFilter) return false;
              if (customerTypeFilter !== 'all' && cust.customerType !== customerTypeFilter) return false;
              if (customerRegionFilter !== 'all' && cust.region.toLowerCase() !== customerRegionFilter.toLowerCase()) return false;
              if (customerIndustryFilter !== 'all' && cust.industry.toLowerCase() !== customerIndustryFilter.toLowerCase()) return false;
              return true;
            });

            // Compact metrics aggregates
            const totalCustomersCount = customers.length;
            const activeCustomersCount = customers.filter(c => c.status === 'Active').length;
            const outstandingReceivablesSum = receivables
              .filter(r => r.status !== 'paid')
              .reduce((sum, r) => sum + r.amount, 0);
            const totalInvoicesCount = invoices.length;
            const currentMonthStr = '2026-06';
            const totalMonthlyRevenueSum = invoices.reduce((sum, inv) => {
              const monthPayments = inv.payments
                .filter(p => p.paymentDate.startsWith(currentMonthStr))
                .reduce((s, p) => s + p.amountReceived, 0);
              return sum + monthPayments;
            }, 0);

            // Helpers for profile
            const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
            const customerInvoices = invoices.filter(inv => selectedCustomer ? inv.clientName === selectedCustomer.name : false);
            const customerReceivables = receivables.filter(rec => selectedCustomer ? rec.client === selectedCustomer.name : false);
            const customerEstimates = savedEstimates.filter(est => selectedCustomer ? est.clientName === selectedCustomer.name : false);

            const customerTotalInvoices = customerInvoices.length;
            const customerOutstandingAmount = customerReceivables
              .filter(r => r.status !== 'paid')
              .reduce((sum, r) => sum + r.amount, 0);
            const customerRevenueGenerated = customerInvoices.reduce((sum, inv) => {
              const paidAmt = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
              return sum + paidAmt;
            }, 0);
            const customerLastInvoiceDate = (() => {
              if (customerInvoices.length === 0) return '—';
              const sorted = [...customerInvoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
              return sorted[0].invoiceDate;
            })();

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="no-print">
                {/* VIEW 1: CUSTOMERS LISTING / DIRECTORY */}
                {customerViewMode === 'list' && (
                  <>
                    {/* PAGE HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customers</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manage customer records used across invoices, estimates and financial operations.</p>
                      </div>
                      <button
                        className="btn-pill btn-pill-primary"
                        type="button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontWeight: 700 }}
                        onClick={() => {
                          setCustomerViewMode('create');
                          setCustomerForm(defaultCustomerForm);
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Customer</span>
                      </button>
                    </div>

                    {/* TOP ACTION BAR & FILTERS */}
                    <div className="card-premium" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Left: Search Customers */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px', maxWidth: '450px' }}>
                          <div className="header-search" style={{ width: '100%', border: '1px solid var(--border-medium)', borderRadius: '8px' }}>
                            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                            <input
                              placeholder="Search by name, company, email, phone..."
                              type="text"
                              value={customerSearchQuery}
                              onChange={(e) => setCustomerSearchQuery(e.target.value)}
                              style={{ fontSize: '0.82rem', height: '24px' }}
                            />
                          </div>
                        </div>

                        {/* Right: Filters */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                          {/* Status */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</span>
                            <PremiumSelect
                              value={customerStatusFilter}
                              onChange={(e) => setCustomerStatusFilter(e.target.value)}
                              className="input-premium"
                              style={{ height: '30px', fontSize: '0.75rem', minWidth: '100px', padding: '0 8px' }}
                            >
                              <option value="all">All Statuses</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </PremiumSelect>
                          </div>

                          {/* Customer Type */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer Type</span>
                            <PremiumSelect
                              value={customerTypeFilter}
                              onChange={(e) => setCustomerTypeFilter(e.target.value)}
                              className="input-premium"
                              style={{ height: '30px', fontSize: '0.75rem', minWidth: '110px', padding: '0 8px' }}
                            >
                              <option value="all">All Types</option>
                              <option value="AMC">AMC</option>
                              <option value="Retainer">Retainer</option>
                              <option value="Project">Project</option>
                              <option value="Dedicated Resource">Dedicated Resource</option>
                              <option value="Product">Product</option>
                              <option value="Other">Other</option>
                            </PremiumSelect>
                          </div>

                          {/* Region */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Region</span>
                            <PremiumSelect
                              value={customerRegionFilter}
                              onChange={(e) => setCustomerRegionFilter(e.target.value)}
                              className="input-premium"
                              style={{ height: '30px', fontSize: '0.75rem', minWidth: '100px', padding: '0 8px' }}
                            >
                              <option value="all">All Regions</option>
                              {uniqueCustomerRegions.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </PremiumSelect>
                          </div>

                          {/* Industry */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Industry</span>
                            <PremiumSelect
                              value={customerIndustryFilter}
                              onChange={(e) => setCustomerIndustryFilter(e.target.value)}
                              className="input-premium"
                              style={{ height: '30px', fontSize: '0.75rem', minWidth: '100px', padding: '0 8px' }}
                              noIcons={true}
                              alignRight={true}
                            >
                              <option value="all">All Industries</option>
                              {uniqueCustomerIndustries.map(ind => (
                                <option key={ind} value={ind}>{ind}</option>
                              ))}
                            </PremiumSelect>
                          </div>

                          {/* Clear Trigger */}
                          {(customerSearchQuery || customerStatusFilter !== 'all' || customerTypeFilter !== 'all' || customerRegionFilter !== 'all' || customerIndustryFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setCustomerSearchQuery('');
                                setCustomerStatusFilter('all');
                                setCustomerTypeFilter('all');
                                setCustomerRegionFilter('all');
                                setCustomerIndustryFilter('all');
                              }}
                              className="btn-pill btn-pill-secondary"
                              type="button"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '16px', height: '30px' }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CUSTOMER SUMMARY STRIP (Compact metrics) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                      <div className="card-premium" style={{ padding: '10px 16px', flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Customers</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{totalCustomersCount}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '10px 16px', flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Customers</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-success-text)' }}>{activeCustomersCount}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '10px 16px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Outstanding Receivables</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-risk-text)' }}>{formatMoney(outstandingReceivablesSum)}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '10px 16px', flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Invoices</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalInvoicesCount}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '10px 16px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Monthly Revenue</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatMoney(totalMonthlyRevenueSum)}</span>
                      </div>
                    </div>

                    {/* CUSTOMERS TABLE */}
                    <section className="card-premium" style={{ padding: '24px 0' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table-premium">
                          <thead>
                            <tr>
                              <th>Customer Name</th>
                              <th>Company</th>
                              <th>Primary Contact</th>
                              <th>Customer Type</th>
                              <th>Region</th>
                              <th>Outstanding Amount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCustomers.length === 0 ? (
                              <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                  No customers match the filter criteria.
                                </td>
                              </tr>
                            ) : (
                              filteredCustomers.map(cust => {
                                // calculate individual outstanding
                                const custRecs = receivables.filter(r => r.client === cust.name);
                                const custOutstanding = custRecs
                                  .filter(r => r.status !== 'paid')
                                  .reduce((sum, r) => sum + r.amount, 0);

                                return (
                                  <tr key={cust.id}>
                                    <td>
                                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{cust.name}</div>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{cust.id}</span>
                                    </td>
                                    <td>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{cust.companyName || '—'}</div>
                                    </td>
                                    <td>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{cust.contactPerson || '—'}</div>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{cust.designation || '—'}</span>
                                    </td>
                                    <td>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{cust.customerType}</span>
                                    </td>
                                    <td>
                                      <div style={{ fontSize: '0.8rem' }}>{cust.region || '—'}</div>
                                    </td>
                                    <td>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: custOutstanding > 0 ? 'var(--color-risk-text)' : 'var(--text-primary)' }}>
                                        {formatMoney(custOutstanding, cust.currency)}
                                      </div>
                                    </td>
                                    <td>
                                      <span
                                        className="pill-badge"
                                        style={{
                                          backgroundColor: cust.status === 'Active' ? 'var(--color-success-light)' : 'var(--border-medium)',
                                          color: cust.status === 'Active' ? 'var(--color-success-text)' : 'var(--text-secondary)',
                                          padding: '3px 8px',
                                          fontSize: '0.68rem',
                                          fontWeight: 700
                                        }}
                                      >
                                        {cust.status.toUpperCase()}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px' }}
                                          title="View Customer Profile"
                                          onClick={() => {
                                            setSelectedCustomerId(cust.id);
                                            setCustomerViewMode('view');
                                            setCustomerProfileTab('overview');
                                          }}
                                        >
                                          <Eye size={12} />
                                        </button>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px' }}
                                          title="Edit Customer"
                                          onClick={() => {
                                            setSelectedCustomerId(cust.id);
                                            setCustomerViewMode('edit');
                                            setCustomerForm({ ...cust });
                                          }}
                                        >
                                          <Edit size={12} />
                                        </button>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px' }}
                                          title="Create Invoice"
                                          onClick={() => {
                                            setInvoiceViewMode('create');
                                            setInvoiceForm({
                                              ...defaultInvoiceForm,
                                              clientName: cust.name,
                                              clientEmail: cust.email,
                                              companyName: cust.companyName,
                                              billingAddress: `${cust.address}, ${cust.city}, ${cust.state}, ${cust.country} ${cust.postalCode}`.trim().replace(/^,\s*|,\s*$/g, '').replace(/\s+/g, ' '),
                                              gstTaxId: cust.gstNumber || cust.taxId,
                                              currency: cust.currency,
                                              paymentTerms: cust.paymentTerms
                                            });
                                            setActiveTab('invoices');
                                          }}
                                        >
                                          <FileText size={12} />
                                        </button>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px' }}
                                          title="Create Estimate"
                                          onClick={() => {
                                            updateProjectEstimate({
                                              clientName: cust.name,
                                              clientRegion: cust.region
                                            });
                                            setActiveTab('simulator');
                                          }}
                                        >
                                          <Zap size={12} />
                                        </button>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px', color: 'var(--color-risk-text)' }}
                                          title="Delete Customer"
                                          onClick={async () => {
                                            if (window.confirm(`Are you sure you want to delete customer "${cust.name}"?`)) {
                                              if (isSupabaseConfigured()) {
                                                const { error } = await supabase.from('customers').delete().eq('id', cust.id);
                                                if (error) {
                                                  console.error('Error deleting customer:', error);
                                                }
                                              }
                                              addAuditLog({
                                                entityType: 'Customer',
                                                entityId: cust.id,
                                                actionType: 'delete',
                                                changeSummary: `Deleted customer '${cust.name}'`
                                              });
                                              setCustomers(prev => prev.filter(c => c.id !== cust.id));
                                            }
                                          }}
                                        >
                                          <Trash size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                )}

                {/* VIEW 2: ADD / EDIT CUSTOMER */}
                {(customerViewMode === 'create' || customerViewMode === 'edit') && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!customerForm.name || !customerForm.companyName) {
                        alert("Customer Name and Company Name are required.");
                        return;
                      }

                      if (customerViewMode === 'create') {
                        let newId = 'CUST-' + Math.floor(100 + Math.random() * 900);
                        if (isSupabaseConfigured()) {
                          const { data, error } = await supabase.from('customers').insert(mapCustomerToDB(customerForm)).select('id').single();
                          if (!error && data) {
                            newId = data.id;
                          } else {
                            console.error('Error creating customer in Supabase:', error);
                          }
                        }
                        const newCustomer: Customer = {
                          ...customerForm,
                          id: newId,
                          createdAt: new Date().toISOString().split('T')[0]
                        } as Customer;
                        setCustomers(prev => [...prev, newCustomer]);
                        addAuditLog({
                          entityType: 'Customer',
                          entityId: newId,
                          actionType: 'create',
                          changeSummary: `Created customer '${customerForm.name}' (${customerForm.companyName})`
                        });
                        alert(`Customer "${customerForm.name}" created successfully.`);
                      } else {
                        if (isSupabaseConfigured() && selectedCustomerId) {
                          const { error } = await supabase.from('customers').update(mapCustomerToDB(customerForm)).eq('id', selectedCustomerId);
                          if (error) {
                            console.error('Error updating customer in Supabase:', error);
                          }
                        }
                        if (selectedCustomerId) {
                          addAuditLog({
                            entityType: 'Customer',
                            entityId: selectedCustomerId,
                            actionType: 'update',
                            changeSummary: `Updated details for customer '${customerForm.name}'`
                          });
                        }
                        setCustomers(prev => prev.map(c => c.id === selectedCustomerId ? { ...c, ...customerForm } as Customer : c));
                        alert(`Customer details updated successfully.`);
                      }
                      setCustomerViewMode('list');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                  >
                    {/* PAGE HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                          {customerViewMode === 'create' ? "Add Customer" : "Edit Customer"}
                        </h2>
                      </div>
                      <button
                        type="button"
                        className="btn-pill btn-pill-secondary"
                        onClick={() => setCustomerViewMode('list')}
                      >
                        <ArrowLeft size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {/* Left Side Forms */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Section 1: Customer Details */}
                        <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                            Customer Details
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Customer Name*</label>
                            <input
                              className="input-premium"
                              type="text"
                              value={customerForm.name}
                              onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                              placeholder="e.g. Acme Corp"
                              required
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Company Name*</label>
                            <input
                              className="input-premium"
                              type="text"
                              value={customerForm.companyName}
                              onChange={e => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                              placeholder="e.g. Acme Corporation"
                              required
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Customer Type</label>
                              <PremiumSelect
                                value={customerForm.customerType}
                                onChange={e => setCustomerForm({ ...customerForm, customerType: e.target.value as any })}
                                className="input-premium"
                              >
                                <option value="AMC">AMC</option>
                                <option value="Retainer">Retainer</option>
                                <option value="Project">Project</option>
                                <option value="Dedicated Resource">Dedicated Resource</option>
                                <option value="Product">Product</option>
                                <option value="Other">Other</option>
                              </PremiumSelect>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Industry</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.industry}
                                onChange={e => setCustomerForm({ ...customerForm, industry: e.target.value })}
                                placeholder="e.g. Technology"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Website</label>
                              <input
                                className="input-premium"
                                type="url"
                                value={customerForm.website}
                                onChange={e => setCustomerForm({ ...customerForm, website: e.target.value })}
                                placeholder="https://..."
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Region</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.region}
                                onChange={e => setCustomerForm({ ...customerForm, region: e.target.value })}
                                placeholder="e.g. US, India, UK"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</label>
                            <PremiumSelect
                              value={customerForm.status}
                              onChange={e => setCustomerForm({ ...customerForm, status: e.target.value as any })}
                              className="input-premium"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </PremiumSelect>
                          </div>
                        </section>

                        {/* Section 2: Primary Contact */}
                        <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                            Primary Contact Details
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Contact Person</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.contactPerson}
                                onChange={e => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                                placeholder="e.g. John Doe"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Designation</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.designation}
                                onChange={e => setCustomerForm({ ...customerForm, designation: e.target.value })}
                                placeholder="e.g. Billing Manager"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</label>
                            <input
                              className="input-premium"
                              type="email"
                              value={customerForm.email}
                              onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                              placeholder="e.g. billing@company.com"
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.phone}
                                onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                placeholder="Office phone"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.mobile}
                                onChange={e => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                placeholder="Mobile number"
                              />
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Right Side Forms */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Section 3: Address Details */}
                        <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                            Address Details
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Street Address</label>
                            <input
                              className="input-premium"
                              type="text"
                              value={customerForm.address}
                              onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                              placeholder="e.g. 123 Suite Road"
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>City</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.city}
                                onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })}
                                placeholder="City"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>State</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.state}
                                onChange={e => setCustomerForm({ ...customerForm, state: e.target.value })}
                                placeholder="State"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Country</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.country}
                                onChange={e => setCustomerForm({ ...customerForm, country: e.target.value })}
                                placeholder="Country"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Postal Code</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.postalCode}
                                onChange={e => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                                placeholder="Postal Code"
                              />
                            </div>
                          </div>
                        </section>

                        {/* Section 4: Billing Details */}
                        <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                            Billing Details
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>GST Number</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.gstNumber}
                                onChange={e => setCustomerForm({ ...customerForm, gstNumber: e.target.value })}
                                placeholder="e.g. 29AAAAA1111A1Z1"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tax ID</label>
                              <input
                                className="input-premium"
                                type="text"
                                value={customerForm.taxId}
                                onChange={e => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                                placeholder="Tax registration number"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Currency</label>
                              <PremiumSelect
                                value={customerForm.currency}
                                onChange={e => setCustomerForm({ ...customerForm, currency: e.target.value })}
                                className="input-premium"
                              >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="AED">AED (AED)</option>
                              </PremiumSelect>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Terms</label>
                              <PremiumSelect
                                value={customerForm.paymentTerms}
                                onChange={e => setCustomerForm({ ...customerForm, paymentTerms: e.target.value as any })}
                                className="input-premium"
                              >
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Custom">Custom</option>
                              </PremiumSelect>
                            </div>
                          </div>
                        </section>

                        {/* Section 5: Notes */}
                        <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px' }}>
                            Notes
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Internal Notes</label>
                            <textarea
                              className="input-premium"
                              rows={2}
                              value={customerForm.internalNotes}
                              onChange={e => setCustomerForm({ ...customerForm, internalNotes: e.target.value })}
                              placeholder="Visible internally only"
                              style={{ resize: 'vertical' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Customer Notes</label>
                            <textarea
                              className="input-premium"
                              rows={2}
                              value={customerForm.customerNotes}
                              onChange={e => setCustomerForm({ ...customerForm, customerNotes: e.target.value })}
                              placeholder="Will be included on invoices and receipts"
                              style={{ resize: 'vertical' }}
                            />
                          </div>
                        </section>
                      </div>
                    </div>

                    {/* SAVE BUTTONS */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="btn-pill btn-pill-secondary"
                        onClick={() => setCustomerViewMode('list')}
                        style={{ height: '38px', padding: '0 20px' }}
                      >
                        Cancel
                      </button>
                      
                      {customerViewMode === 'create' && (
                        <button
                          type="button"
                          className="btn-pill btn-pill-secondary"
                          onClick={async () => {
                            if (!customerForm.name || !customerForm.companyName) {
                              alert("Customer Name and Company Name are required.");
                              return;
                            }
                            let newId = 'CUST-' + Math.floor(100 + Math.random() * 900);
                            if (isSupabaseConfigured()) {
                              const { data, error } = await supabase.from('customers').insert(mapCustomerToDB(customerForm)).select('id').single();
                              if (!error && data) {
                                newId = data.id;
                              } else {
                                console.error('Error creating customer in Supabase:', error);
                              }
                            }
                            const newCustomer: Customer = {
                              ...customerForm,
                              id: newId,
                              createdAt: new Date().toISOString().split('T')[0]
                            } as Customer;
                            setCustomers(prev => [...prev, newCustomer]);
                            addAuditLog({
                              entityType: 'Customer',
                              entityId: newId,
                              actionType: 'create',
                              changeSummary: `Created customer '${newCustomer.name}' (${newCustomer.companyName}) via Save & Add Another`
                            });
                            setCustomerForm(defaultCustomerForm);
                            alert(`Customer "${newCustomer.name}" added. Form cleared to add another.`);
                          }}
                          style={{ height: '38px', padding: '0 20px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                          Save & Add Another
                        </button>
                      )}

                      <button
                        type="submit"
                        className="btn-pill btn-pill-primary"
                        style={{ height: '38px', padding: '0 24px', fontWeight: 700 }}
                      >
                        Save Customer
                      </button>
                    </div>
                  </form>
                )}

                {/* VIEW 3: CUSTOMER PROFILE */}
                {customerViewMode === 'view' && selectedCustomer && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* BACK BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn-pill btn-pill-secondary"
                        onClick={() => setCustomerViewMode('list')}
                      >
                        <ArrowLeft size={16} />
                        <span>Back to Directory</span>
                      </button>

                      <button
                        type="button"
                        className="btn-pill btn-pill-secondary"
                        onClick={() => {
                          setCustomerViewMode('edit');
                          setCustomerForm({ ...selectedCustomer });
                        }}
                      >
                        <Edit size={14} />
                        <span>Edit Details</span>
                      </button>
                    </div>

                    {/* PROFILE HEADER */}
                    <div className="card-premium" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedCustomer.name}</h2>
                            <span
                              className="pill-badge"
                              style={{
                                backgroundColor: selectedCustomer.status === 'Active' ? 'var(--color-success-light)' : 'var(--border-medium)',
                                color: selectedCustomer.status === 'Active' ? 'var(--color-success-text)' : 'var(--text-secondary)',
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700
                              }}
                            >
                              {selectedCustomer.status.toUpperCase()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedCustomer.companyName}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <div>
                            <strong>Type:</strong> {selectedCustomer.customerType}
                          </div>
                          <div style={{ width: '1px', backgroundColor: 'var(--border-medium)', height: '14px' }} />
                          <div>
                            <strong>Region:</strong> {selectedCustomer.region || '—'}
                          </div>
                          <div style={{ width: '1px', backgroundColor: 'var(--border-medium)', height: '14px' }} />
                          <div>
                            <strong>Primary Contact:</strong> {selectedCustomer.contactPerson || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SUMMARY STRIP */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                      <div className="card-premium" style={{ padding: '12px 18px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Invoices</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{customerTotalInvoices}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '12px 18px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Outstanding Amount</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-risk-text)' }}>{formatMoney(customerOutstandingAmount, selectedCustomer.currency)}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '12px 18px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Revenue Generated</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success-text)' }}>{formatMoney(customerRevenueGenerated, selectedCustomer.currency)}</span>
                      </div>
                      <div className="card-premium" style={{ padding: '12px 18px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Last Invoice Date</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{customerLastInvoiceDate}</span>
                      </div>
                    </div>

                    {/* DETAIL TABS HEADER */}
                    <div style={{ display: 'flex', borderBottom: '2px solid var(--border-medium)', gap: '24px' }}>
                      {(['overview', 'invoices', 'receivables', 'estimates'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setCustomerProfileTab(tab)}
                          type="button"
                          style={{
                            padding: '12px 4px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: customerProfileTab === tab ? 'var(--color-primary)' : 'var(--text-secondary)',
                            borderBottom: customerProfileTab === tab ? '3px solid var(--color-primary)' : '3px solid transparent',
                            marginBottom: '-2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em'
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* DETAIL TAB CONTENTS */}
                    <div style={{ marginTop: '8px' }}>
                      {/* OVERVIEW TAB */}
                      {customerProfileTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Customer Info Card */}
                            <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px', color: 'var(--text-secondary)' }}>
                                Customer Information
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                <div><strong>Website:</strong> {selectedCustomer.website ? <a href={selectedCustomer.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{selectedCustomer.website}</a> : '—'}</div>
                                <div><strong>Industry:</strong> {selectedCustomer.industry || '—'}</div>
                                <div><strong>Region:</strong> {selectedCustomer.region || '—'}</div>
                                <div><strong>Status:</strong> {selectedCustomer.status}</div>
                                <div><strong>Created On:</strong> {selectedCustomer.createdAt || '—'}</div>
                              </div>
                            </section>

                            {/* Contact Details Card */}
                            <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px', color: 'var(--text-secondary)' }}>
                                Contact Details
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                <div><strong>Contact Person:</strong> {selectedCustomer.contactPerson || '—'}</div>
                                <div><strong>Designation:</strong> {selectedCustomer.designation || '—'}</div>
                                <div><strong>Email Address:</strong> {selectedCustomer.email ? <a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--color-primary)' }}>{selectedCustomer.email}</a> : '—'}</div>
                                <div><strong>Phone:</strong> {selectedCustomer.phone || '—'}</div>
                                <div><strong>Mobile:</strong> {selectedCustomer.mobile || '—'}</div>
                              </div>
                            </section>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Billing & Address Card */}
                            <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px', color: 'var(--text-secondary)' }}>
                                Billing & Address Details
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                <div><strong>GST Number:</strong> {selectedCustomer.gstNumber || '—'}</div>
                                <div><strong>Tax ID:</strong> {selectedCustomer.taxId || '—'}</div>
                                <div><strong>Default Currency:</strong> {selectedCustomer.currency}</div>
                                <div><strong>Payment Terms:</strong> {selectedCustomer.paymentTerms}</div>
                                <div style={{ height: '1px', backgroundColor: 'var(--border-medium)', margin: '4px 0' }} />
                                <div><strong>Street Address:</strong> {selectedCustomer.address || '—'}</div>
                                <div><strong>City:</strong> {selectedCustomer.city || '—'}</div>
                                <div><strong>State:</strong> {selectedCustomer.state || '—'}</div>
                                <div><strong>Country:</strong> {selectedCustomer.country || '—'}</div>
                                <div><strong>Postal Code:</strong> {selectedCustomer.postalCode || '—'}</div>
                              </div>
                            </section>

                            {/* Notes Card */}
                            <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-medium)', paddingBottom: '6px', color: 'var(--text-secondary)' }}>
                                Internal & Customer Notes
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                                <div>
                                  <strong>Internal Notes:</strong>
                                  <p style={{ marginTop: '4px', fontStyle: 'italic', backgroundColor: 'var(--bg-input)', padding: '8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                                    {selectedCustomer.internalNotes || 'No internal notes recorded.'}
                                  </p>
                                </div>
                                <div>
                                  <strong>Customer Notes:</strong>
                                  <p style={{ marginTop: '4px', backgroundColor: 'var(--bg-input)', padding: '8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                                    {selectedCustomer.customerNotes || 'No customer notes recorded.'}
                                  </p>
                                </div>
                              </div>
                            </section>
                          </div>
                        </div>
                      )}

                      {/* INVOICES TAB */}
                      {customerProfileTab === 'invoices' && (
                        <div className="card-premium" style={{ padding: '16px 0' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="table-premium">
                              <thead>
                                <tr>
                                  <th>Invoice ID</th>
                                  <th>Project Name</th>
                                  <th>Invoice Date</th>
                                  <th>Due Date</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerInvoices.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                      No invoices found for this customer.
                                    </td>
                                  </tr>
                                ) : (
                                  customerInvoices.map(inv => (
                                    <tr key={inv.id}>
                                      <td style={{ fontWeight: 800 }}>{inv.id}</td>
                                      <td>{inv.projectName || '—'}</td>
                                      <td>{inv.invoiceDate}</td>
                                      <td>{inv.dueDate}</td>
                                      <td style={{ fontWeight: 700 }}>{formatMoney(inv.totalAmount, inv.currency)}</td>
                                      <td>
                                        <span
                                          className="pill-badge"
                                          style={{
                                            backgroundColor: inv.status === 'Paid' ? 'var(--color-success-light)' : inv.status === 'Draft' ? 'var(--border-medium)' : 'rgba(79, 124, 255, 0.1)',
                                            color: inv.status === 'Paid' ? 'var(--color-success-text)' : inv.status === 'Draft' ? 'var(--text-secondary)' : 'var(--color-primary)',
                                            padding: '2px 6px',
                                            fontSize: '0.65rem'
                                          }}
                                        >
                                          {inv.status.toUpperCase()}
                                        </span>
                                      </td>
                                      <td>
                                        <button
                                          className="circle-btn"
                                          type="button"
                                          style={{ width: '26px', height: '26px' }}
                                          title="View Invoice Details"
                                          onClick={() => {
                                            setSelectedInvoiceId(inv.id);
                                            setInvoiceViewMode('view');
                                            setActiveTab('invoices');
                                          }}
                                        >
                                          <Eye size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* RECEIVABLES TAB */}
                      {customerProfileTab === 'receivables' && (
                        <div className="card-premium" style={{ padding: '16px 0' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="table-premium">
                              <thead>
                                <tr>
                                  <th>Receivable ID</th>
                                  <th>Invoice ID</th>
                                  <th>Due Date</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Risk Level</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerReceivables.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                      No receivables found for this customer.
                                    </td>
                                  </tr>
                                ) : (
                                  customerReceivables.map(rec => (
                                    <tr key={rec.id}>
                                      <td style={{ fontWeight: 800 }}>{rec.id}</td>
                                      <td>{rec.invoice || '—'}</td>
                                      <td>{rec.dueDate}</td>
                                      <td style={{ fontWeight: 700 }}>{formatMoney(rec.amount, rec.currency)}</td>
                                      <td>
                                        <span
                                          className="pill-badge"
                                          style={{
                                            backgroundColor: rec.status === 'paid' ? 'var(--color-success-light)' : rec.status === 'overdue' ? 'var(--color-risk-light)' : 'rgba(79, 124, 255, 0.1)',
                                            color: rec.status === 'paid' ? 'var(--color-success-text)' : rec.status === 'overdue' ? 'var(--color-risk-text)' : 'var(--color-primary)',
                                            padding: '2px 6px',
                                            fontSize: '0.65rem'
                                          }}
                                        >
                                          {rec.status.toUpperCase()}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className="pill-badge"
                                          style={{
                                            backgroundColor: rec.collectionRisk === 'high' ? 'var(--color-risk-light)' : rec.collectionRisk === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-success-light)',
                                            color: rec.collectionRisk === 'high' ? 'var(--color-risk-text)' : rec.collectionRisk === 'medium' ? '#d97706' : 'var(--color-success-text)',
                                            padding: '2px 6px',
                                            fontSize: '0.65rem'
                                          }}
                                        >
                                          {rec.collectionRisk.toUpperCase()}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* ESTIMATES TAB */}
                      {customerProfileTab === 'estimates' && (
                        <div className="card-premium" style={{ padding: '16px 0' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="table-premium">
                              <thead>
                                <tr>
                                  <th>Estimate ID</th>
                                  <th>Project Name</th>
                                  <th>Contract Type</th>
                                  <th>Estimated Hours</th>
                                  <th>Quote Amount</th>
                                  <th>Margin Health</th>
                                  <th>Created Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerEstimates.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                      No estimates found for this customer.
                                    </td>
                                  </tr>
                                ) : (
                                  customerEstimates.map(est => (
                                    <tr key={est.id}>
                                      <td style={{ fontWeight: 800 }}>{est.id}</td>
                                      <td>{est.projectName}</td>
                                      <td>{est.contractType.replace('_', ' ').toUpperCase()}</td>
                                      <td>{est.estimatedHours} hrs</td>
                                      <td style={{ fontWeight: 700 }}>{formatMoney(est.recommendedQuote)}</td>
                                      <td>
                                        <span
                                          className="pill-badge"
                                          style={{
                                            backgroundColor: est.marginHealth === 'Passed' ? 'var(--color-success-light)' : est.marginHealth === 'Flagged' ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-risk-light)',
                                            color: est.marginHealth === 'Passed' ? 'var(--color-success-text)' : est.marginHealth === 'Flagged' ? '#d97706' : 'var(--color-risk-text)',
                                            padding: '2px 6px',
                                            fontSize: '0.65rem'
                                          }}
                                        >
                                          {est.marginHealth.toUpperCase()}
                                        </span>
                                      </td>
                                      <td>{est.timestamp ? est.timestamp.split('T')[0] : '—'}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB: FINANCIAL SETTINGS (Workforce Economics & Overheads) */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Configure company workforce resource rates, corporate overhead shares, and regional pricing margins.</p>
                </div>
              </div>

              {/* Currency & Exchange Rate Setting Widget */}
              <div className="grid-responsive-2">
                <section className="card-premium">
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Base Currency Config</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <PremiumSelect
                        className="input-premium"
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="AED">AED (AED) - UAE Dirham</option>
                      </PremiumSelect>
                      <button className="circle-btn" style={{ width: '40px', height: '40px', border: '1px solid var(--border-medium)', borderRadius: '12px' }} onClick={recompute}>
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      All estimations, recurring hubs, and dashboard cards convert automatically based on the base operating currency selected.
                    </span>
                  </div>
                </section>

                <section className="card-premium">
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Exchange Rate Matrix</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>1 USD:</span>
                      <input
                        type="number"
                        step="0.01"
                        style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', fontWeight: 700, width: '100px', color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-medium)' }}
                        value={exchangeRates.USD?.[baseCurrency] || 0}
                        onChange={(e) => updateExchangeRate('USD', baseCurrency, parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>1 GBP:</span>
                      <input
                        type="number"
                        step="0.01"
                        style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', fontWeight: 700, width: '100px', color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-medium)' }}
                        value={exchangeRates.GBP?.[baseCurrency] || 0}
                        onChange={(e) => updateExchangeRate('GBP', baseCurrency, parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>1 AED:</span>
                      <input
                        type="number"
                        step="0.01"
                        style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', fontWeight: 700, width: '100px', color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-medium)' }}
                        value={exchangeRates.AED?.[baseCurrency] || 0}
                        onChange={(e) => updateExchangeRate('AED', baseCurrency, parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Sub-tabs or split layout for Workforce vs Overheads */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px' }}>
                  <button
                    className="btn-pill"
                    style={{
                      backgroundColor: activeConfigTab === 'workforce' ? 'var(--color-primary-light)' : 'transparent',
                      color: activeConfigTab === 'workforce' ? 'var(--color-primary)' : 'var(--text-secondary)',
                      border: 'none',
                      boxShadow: 'none'
                    }}
                    onClick={() => setActiveConfigTab('workforce')}
                  >
                    <Users size={16} />
                    <span>Workforce Capacity Rates</span>
                  </button>
                  <button
                    className="btn-pill"
                    style={{
                      backgroundColor: activeConfigTab === 'overheads' ? 'var(--color-primary-light)' : 'transparent',
                      color: activeConfigTab === 'overheads' ? 'var(--color-primary)' : 'var(--text-secondary)',
                      border: 'none',
                      boxShadow: 'none'
                    }}
                    onClick={() => setActiveConfigTab('overheads')}
                  >
                    <Server size={16} />
                    <span>Corporate Overheads & Infrastructure</span>
                  </button>
                </div>

                {/* Active Config Tab Rendering */}
                    {activeConfigTab === 'workforce' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Configure workforce role card */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Workforce Resource Center</h3>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Monthly Payroll Burdens: <span style={{ color: 'var(--color-primary)' }}>{formatMoney(metrics.totalWorkforceCostMonth)}</span>
                          </span>
                        </div>

                        {/* Add employee role form */}
                        <section className="card-premium">
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                            <span>Configure New Workforce Role</span>
                          </h3>

                          <div className="form-container-premium">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role / Title</label>
                              <input
                                className="input-premium"
                                type="text"
                                placeholder="e.g. Lead QA Engineer"
                                value={newEmp.roleName}
                                onChange={(e) => setNewEmp({ ...newEmp, roleName: e.target.value })}
                              />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</label>
                              <PremiumSelect
                                className="input-premium"
                                value={newEmp.department}
                                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                              >
                                <option value="Engineering">Engineering</option>
                                <option value="Design">Design</option>
                                <option value="Product">Product Management</option>
                                <option value="QA">QA Testing</option>
                                <option value="DevOps">DevOps & Cloud</option>
                              </PremiumSelect>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Annual Salary</label>
                              <input
                                className="input-premium"
                                type="number"
                                value={newEmp.annualSalary}
                                onChange={(e) => setNewEmp({ ...newEmp, annualSalary: parseInt(e.target.value) || 0 })}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Salary Currency</label>
                              <PremiumSelect
                                className="input-premium"
                                value={newEmp.salaryCurrency}
                                onChange={(e) => setNewEmp({ ...newEmp, salaryCurrency: e.target.value })}
                              >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="AED">AED (AED)</option>
                              </PremiumSelect>
                            </div>

                            <button
                              className="btn-pill btn-pill-primary"
                              style={{ gridColumn: '1 / -1', justifySelf: 'end', marginTop: '10px' }}
                              onClick={() => {
                                if (!newEmp.roleName) {
                                  alert('Please enter a role name.');
                                  return;
                                }
                                addEmployee({ ...newEmp, activeStatus: true });
                                recompute();
                                setNewEmp({
                                  roleName: '',
                                  department: 'Engineering',
                                  annualSalary: 800000,
                                  salaryCurrency: 'INR',
                                  totalWorkingHoursMonth: 176,
                                  utilizationPercent: 80,
                                  allocationFactor: 1.0,
                                  overheadMultiplier: 1.0,
                                  meetingsHours: 12,
                                  operationsHours: 8,
                                  leaveHours: 8,
                                  internalSupportHours: 5,
                                  learningHours: 10
                                });
                              }}
                            >
                              <Plus size={16} />
                              <span>Insert Role into Pool</span>
                            </button>
                          </div>
                        </section>

                        {/* List employees */}
                        <div className="grid-responsive-2">
                          {employees.map((emp) => {
                            const prodHours = calculateProductiveHours(
                              emp.totalWorkingHoursMonth,
                              emp.meetingsHours,
                              emp.operationsHours,
                              emp.leaveHours,
                              emp.internalSupportHours,
                              emp.learningHours
                            );
                            
                            const salaryInBase = convertCurrency(emp.annualSalary/12, emp.salaryCurrency, baseCurrency, exchangeRates);
                            const activeCapacity = Math.max(1, metrics.totalProductiveHoursMonth);
                            const overheadSharePerHour = (metrics.totalInfraCostMonth + metrics.totalSaaSCostMonth + metrics.totalOverheadCostMonth) / activeCapacity;
                            const employeeCostAllocation = overheadSharePerHour * prodHours;

                            const effCost = calculateEffectiveHourlyCost(
                              salaryInBase,
                              employeeCostAllocation,
                              prodHours
                            );

                            return (
                              <div
                                key={emp.id}
                                className="card-premium"
                                style={{
                                  opacity: emp.activeStatus ? 1 : 0.55,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '20px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{emp.roleName}</h3>
                                      <span className="pill-badge pill-badge-muted" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>{emp.department}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                      Salary: {formatMoney(emp.annualSalary, emp.salaryCurrency)}/yr ({formatMoney(emp.annualSalary/12, emp.salaryCurrency)}/mo)
                                    </span>
                                  </div>

                                  <div className="circle-btn" style={{ cursor: 'default', backgroundColor: 'var(--bg-input)', fontWeight: 700 }}>
                                    {emp.utilizationPercent}%
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-medium)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <span>Productive capacity:</span>
                                    <span style={{ color: 'var(--color-primary)' }}>{prodHours.toFixed(0)} hours / month</span>
                                  </div>
                                  <div style={{ height: '4px', backgroundColor: 'var(--border-medium)', borderRadius: '9999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: `${Math.min(100, (prodHours / emp.totalWorkingHoursMonth) * 100)}%` }}></div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    <div>Meetings: <strong>{emp.meetingsHours}h</strong></div>
                                    <div>Operations: <strong>{emp.operationsHours}h</strong></div>
                                    <div>Leave: <strong>{emp.leaveHours}h</strong></div>
                                    <div>Support: <strong>{emp.internalSupportHours}h</strong></div>
                                    <div>Learning: <strong>{emp.learningHours}h</strong></div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Effective Burn</div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-success-text)' }}>
                                      {formatMoney(effCost)}/hr
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      className="btn-pill btn-pill-secondary"
                                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      onClick={() => {
                                        updateEmployee(emp.id, { activeStatus: !emp.activeStatus });
                                        recompute();
                                      }}
                                    >
                                      {emp.activeStatus ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                      className="circle-btn"
                                      style={{ color: 'var(--color-risk)' }}
                                      onClick={() => {
                                        deleteEmployee(emp.id);
                                        recompute();
                                      }}
                                    >
                                      <Trash size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeConfigTab === 'overheads' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Overheads breakdown stats */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Operational Overheads & Licensing</h3>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Total Monthly Overhead Burn: <span style={{ color: 'var(--color-primary)' }}>{formatMoney(metrics.totalInfraCostMonth + metrics.totalSaaSCostMonth + metrics.totalOverheadCostMonth)}</span>
                          </span>
                        </div>

                        {/* Cloud, SaaS, General Overheads panels */}
                        <div className="grid-responsive-3">
                          {/* Cloud Infrastructure */}
                          <section className="card-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Cloud Infrastructure</h3>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatMoney(metrics.totalInfraCostMonth)}/mo</span>
                            </div>
                            
                            {/* Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-medium)', marginBottom: '20px' }}>
                              <input
                                className="input-premium"
                                style={{ padding: '8px 14px', borderRadius: '10px' }}
                                type="text"
                                placeholder="Service Name"
                                value={newInfra.serviceName}
                                onChange={(e) => setNewInfra({ ...newInfra, serviceName: e.target.value })}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px' }}
                                  type="number"
                                  placeholder="Cost"
                                  value={newInfra.monthlyCost}
                                  onChange={(e) => setNewInfra({ ...newInfra, monthlyCost: parseFloat(e.target.value) || 0 })}
                                />
                                <PremiumSelect
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px', width: '80px' }}
                                  value={newInfra.costCurrency}
                                  onChange={(e) => setNewInfra({ ...newInfra, costCurrency: e.target.value })}
                                >
                                  <option value="USD">USD</option>
                                  <option value="INR">INR</option>
                                  <option value="GBP">GBP</option>
                                </PremiumSelect>
                              </div>
                              <button
                                className="btn-pill btn-pill-primary"
                                style={{ padding: '8px 12px', borderRadius: '10px', width: '100%' }}
                                onClick={() => {
                                  if (!newInfra.serviceName) return;
                                  addInfraService({ ...newInfra, activeStatus: true });
                                  recompute();
                                  setNewInfra({
                                    serviceName: '',
                                    category: 'AWS',
                                    monthlyCost: 100,
                                    costCurrency: 'USD',
                                    allocationType: 'organization_wide',
                                    allocationPercent: 100,
                                    projectDependency: false
                                  });
                                }}
                              >
                                Add Service
                              </button>
                            </div>

                            {/* List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
                              {infraServices.map((is) => {
                                const costInBase = convertCurrency(is.monthlyCost, is.costCurrency, baseCurrency, exchangeRates);
                                return (
                                  <div key={is.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{is.serviceName}</div>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatMoney(is.monthlyCost, is.costCurrency)}{is.costCurrency !== baseCurrency && ` (${formatMoney(costInBase)})`}</span>
                                    </div>
                                    <button className="circle-btn" style={{ width: '28px', height: '28px', color: 'var(--color-risk)' }} onClick={() => { deleteInfraService(is.id); recompute(); }}>
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          {/* SaaS Tooling */}
                          <section className="card-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>SaaS & AI Tooling</h3>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatMoney(metrics.totalSaaSCostMonth)}/mo</span>
                            </div>

                            {/* Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-medium)', marginBottom: '20px' }}>
                              <input
                                className="input-premium"
                                style={{ padding: '8px 14px', borderRadius: '10px' }}
                                type="text"
                                placeholder="Tool Name"
                                value={newSaas.toolName}
                                onChange={(e) => setNewSaas({ ...newSaas, toolName: e.target.value })}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px' }}
                                  type="number"
                                  placeholder="Cost"
                                  value={newSaas.monthlyCost}
                                  onChange={(e) => setNewSaas({ ...newSaas, monthlyCost: parseFloat(e.target.value) || 0 })}
                                />
                                <PremiumSelect
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px', width: '80px' }}
                                  value={newSaas.costCurrency}
                                  onChange={(e) => setNewSaas({ ...newSaas, costCurrency: e.target.value })}
                                >
                                  <option value="USD">USD</option>
                                  <option value="INR">INR</option>
                                </PremiumSelect>
                              </div>
                              <button
                                className="btn-pill btn-pill-primary"
                                style={{ padding: '8px 12px', borderRadius: '10px', width: '100%' }}
                                onClick={() => {
                                  if (!newSaas.toolName) return;
                                  addSaasTool({ ...newSaas, activeStatus: true });
                                  recompute();
                                  setNewSaas({
                                    toolName: '',
                                    category: 'Productivity',
                                    monthlyCost: 10,
                                    costCurrency: 'USD',
                                    seats: 5,
                                    allocationPercent: 100,
                                    aiDependency: false
                                  });
                                }}
                              >
                                Add Tool
                              </button>
                            </div>

                            {/* List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
                              {saasTools.map((st) => {
                                const costInBase = convertCurrency(st.monthlyCost * st.seats, st.costCurrency, baseCurrency, exchangeRates);
                                return (
                                  <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{st.toolName}</div>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatMoney(st.monthlyCost, st.costCurrency)} x {st.seats} seats{st.costCurrency !== baseCurrency && ` (Total: ${formatMoney(costInBase)})`}</span>
                                    </div>
                                    <button className="circle-btn" style={{ width: '28px', height: '28px', color: 'var(--color-risk)' }} onClick={() => { deleteSaasTool(st.id); recompute(); }}>
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          {/* General Overheads */}
                          <section className="card-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>General Overheads</h3>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatMoney(metrics.totalOverheadCostMonth)}/mo</span>
                            </div>

                            {/* Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-medium)', marginBottom: '20px' }}>
                              <input
                                className="input-premium"
                                style={{ padding: '8px 14px', borderRadius: '10px' }}
                                type="text"
                                placeholder="Overhead Category"
                                value={newOverhead.categoryName}
                                onChange={(e) => setNewOverhead({ ...newOverhead, categoryName: e.target.value })}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px' }}
                                  type="number"
                                  placeholder="Cost"
                                  value={newOverhead.monthlyCost}
                                  onChange={(e) => setNewOverhead({ ...newOverhead, monthlyCost: parseFloat(e.target.value) || 0 })}
                                />
                                <PremiumSelect
                                  className="input-premium"
                                  style={{ padding: '8px 14px', borderRadius: '10px', width: '80px' }}
                                  value={newOverhead.costCurrency}
                                  onChange={(e) => setNewOverhead({ ...newOverhead, costCurrency: e.target.value })}
                                >
                                  <option value="INR">INR</option>
                                  <option value="USD">USD</option>
                                </PremiumSelect>
                              </div>
                              <button
                                className="btn-pill btn-pill-primary"
                                style={{ padding: '8px 12px', borderRadius: '10px', width: '100%' }}
                                onClick={() => {
                                  if (!newOverhead.categoryName) return;
                                  addOverhead({ ...newOverhead, recurring: true });
                                  recompute();
                                  setNewOverhead({
                                    categoryName: '',
                                    monthlyCost: 10000,
                                    costCurrency: 'INR',
                                    allocationLogic: 'capacity_division'
                                  });
                                }}
                              >
                                Add Overhead
                              </button>
                            </div>

                            {/* List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
                              {overheads.map((o) => {
                                const costInBase = convertCurrency(o.monthlyCost, o.costCurrency, baseCurrency, exchangeRates);
                                return (
                                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{o.categoryName}</div>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatMoney(o.monthlyCost, o.costCurrency)}{o.costCurrency !== baseCurrency && ` (${formatMoney(costInBase)})`}</span>
                                    </div>
                                    <button className="circle-btn" style={{ width: '28px', height: '28px', color: 'var(--color-risk)' }} onClick={() => { deleteOverhead(o.id); recompute(); }}>
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operational Activity Audit Log Timeline */}
                  <section className="card-premium" style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <History size={18} style={{ color: 'var(--color-primary)' }} />
                      <span>Operational Activity Audit Log</span>
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                      {auditLogs.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          No activity logs recorded yet.
                        </div>
                      ) : (
                        auditLogs.map((log) => {
                          let icon = <History size={14} style={{ color: 'var(--text-secondary)' }} />;
                          let iconBg = 'var(--bg-input)';
                          
                          if (log.actionType === 'create') {
                            icon = <Plus size={14} style={{ color: 'var(--color-success)' }} />;
                            iconBg = 'rgba(16, 185, 129, 0.1)';
                          } else if (log.actionType === 'update') {
                            icon = <Edit size={12} style={{ color: 'var(--color-primary)' }} />;
                            iconBg = 'rgba(79, 124, 255, 0.1)';
                          } else if (log.actionType === 'delete') {
                            icon = <Trash size={12} style={{ color: 'var(--color-risk)' }} />;
                            iconBg = 'rgba(239, 68, 68, 0.1)';
                          }
                          
                          return (
                            <div key={log.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                              <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                backgroundColor: iconBg, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                flexShrink: 0 
                              }}>
                                {icon}
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {log.changeSummary}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 700, 
                                    textTransform: 'uppercase', 
                                    backgroundColor: 'var(--bg-input)', 
                                    color: 'var(--text-secondary)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px' 
                                  }}>
                                    {log.entityType}
                                  </span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                    ID: {log.entityId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

            </div>
          )}

          {/* TAB 5: ESTIMATE HISTORY & ARCHIVE VIEW */}
          {activeTab === 'archive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Organizational Estimate Library</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Appraise, reload, and verify historical simulation records across different client regions.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="pill-badge pill-badge-muted">
                    <span>Saved Estimates: <strong>{savedEstimates.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Organizational Burn Summary Strips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', height: '110px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Monthly Base Burn</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatMoney(metrics.monthlyOrganizationalBurn)}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Workforce + Shared Admin</span>
                </div>
                <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', height: '110px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Breakeven Billing Rate</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatMoney(metrics.effectiveHourlyBurn)}/hr</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600 }}>Productive efficiency adjusted</span>
                </div>
                <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', height: '110px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safe Minimum Margin</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{marginPolicy.minimumSafeMargin}%</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Corporate baseline boundary</span>
                </div>
                <div className="card-premium" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', height: '110px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Confidence Median</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{Math.round(metrics.simConfidenceScore)}%</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', fontWeight: 600 }}>Active audit rating</span>
                </div>
              </div>

              {/* Split Layout: Library Table vs Checklist */}
              <div className="layout-split">
                {/* Left: Saved Estimate Table */}
                <section className="card-premium" style={{ padding: '24px 0' }}>
                  <div style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <History size={18} style={{ color: 'var(--color-primary)' }} />
                      <span>Estimate Archive Scenarios</span>
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saved scenarios</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    {savedEstimates.length === 0 ? (
                      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Info size={24} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                        <h4 style={{ fontWeight: 700 }}>No Saved Estimates Found</h4>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Save your current simulation configuration in the Simulator Cockpit tab.</p>
                      </div>
                    ) : (
                      <table className="table-premium">
                        <thead>
                          <tr>
                            <th>Scenario & Client</th>
                            <th>Details</th>
                            <th>Quotation</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedEstimates.map((est) => {
                            return (
                              <tr key={est.id}>
                                <td>
                                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{est.projectName}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Client: {est.clientName}</div>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Region: {est.clientRegion}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Margin: {est.targetMargin}% | {est.deliveryTimelineDays} days</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                                    {formatMoney(est.recommendedQuote, baseCurrency)}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Est. NPV: {formatMoney(est.recommendedQuote * 0.96, baseCurrency)}</div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                      className="btn-pill btn-pill-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                                      onClick={() => {
                                        loadArchivedEstimate(est.id);
                                        recompute();
                                        alert(`Loaded estimate scenario: "${est.projectName}"`);
                                        setActiveTab('simulator');
                                      }}
                                    >
                                      Load
                                    </button>
                                    <button 
                                      className="btn-pill btn-pill-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                                      onClick={() => {
                                        setInvoiceForm({
                                          id: undefined,
                                          clientName: est.clientName,
                                          clientEmail: est.clientName.toLowerCase().replace(/\s+/g, '') + '@company.com',
                                          companyName: est.clientName,
                                          billingAddress: est.clientRegion + ' Corporate Office',
                                          gstTaxId: 'TAX-' + Math.floor(Math.random() * 900000 + 100000),
                                          currency: 'INR',
                                          invoiceDate: new Date().toISOString().split('T')[0],
                                          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                          paymentTerms: 'Net 15',
                                          items: [
                                            { 
                                              id: '1', 
                                              description: `Project implementation estimate for ${est.projectName}`, 
                                              qty: 1, 
                                              rate: est.recommendedQuote, 
                                              taxPercent: 18,
                                              amount: est.recommendedQuote * 1.18 
                                            }
                                          ],
                                          subtotal: est.recommendedQuote,
                                          taxAmount: est.recommendedQuote * 0.18,
                                          discount: 0,
                                          totalAmount: est.recommendedQuote * 1.18,
                                          dueAmount: est.recommendedQuote * 1.18,
                                          termsAndConditions: '1. Please pay within 15 days of invoice date.\n2. Standard terms and conditions apply.',
                                          internalNotes: `Converted from Saved Estimate Scenario: ${est.projectName}`,
                                          customerNotes: `Thank you for choosing us for your project ${est.projectName}!`,
                                          status: 'Draft',
                                          payments: [],
                                          projectName: est.projectName
                                        });
                                        setInvoiceViewMode('create');
                                        setActiveTab('invoices');
                                      }}
                                    >
                                      Invoice
                                    </button>
                                    <button 
                                      className="circle-btn" 
                                      style={{ width: '28px', height: '28px', color: 'var(--color-risk)' }}
                                      onClick={() => {
                                        if (confirm(`Delete estimate: "${est.projectName}"?`)) {
                                          deleteArchivedEstimate(est.id);
                                        }
                                      }}
                                    >
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>

                {/* Right Column: Checklists & AI learning logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Risk Patterns Checklist */}
                  <section className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Risk Pattern Screening</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Immediate checks flags derived from the active scenario configuration:</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className={`risk-check-item ${projectEstimate.targetMargin < marginPolicy.minimumSafeMargin ? 'flagged' : ''}`}>
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Safe Margin Threshold:</strong> {projectEstimate.targetMargin < marginPolicy.minimumSafeMargin ? `Simulated margin (${projectEstimate.targetMargin}%) violates safe corporate threshold (${marginPolicy.minimumSafeMargin}%).` : 'Target margin covers corporate baseline successfully.'}
                        </div>
                      </div>

                      <div className={`risk-check-item ${metrics.simNPV < metrics.simRecommendedQuote * 0.95 ? 'flagged' : ''}`}>
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Milestone Payment NPV Lag:</strong> {metrics.simNPV < metrics.simRecommendedQuote * 0.95 ? 'Payment delays exceed 5% NPV erosion threshold. Restructure milestones.' : 'Milestone payout timeline holds positive cash recovery.'}
                        </div>
                      </div>

                      <div className={`risk-check-item ${projectEstimate.contractType === 'fixed_cost' && projectEstimate.contingencyPercent < 15 ? 'flagged' : ''}`}>
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Contingency Buffer Leak:</strong> {projectEstimate.contractType === 'fixed_cost' && projectEstimate.contingencyPercent < 15 ? 'Fixed Price projects require a minimum 15% contingency. Current contingency is insufficient.' : 'Contingency is adequately budgeted for scope slips.'}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* AI Learning Console summary */}
                  <section className="card-premium" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid rgba(79, 124, 255, 0.15)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Sparkles size={14} />
                      <span>Pricing Engine Learning Engine</span>
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Based on historically archived bids, organizational billing stability improves by 12% when client scope proposals undergo full AI strategy critique prior to client submission.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}



        </div>
            {/* Right Drawer Backdrop */}
      {isDetailDrawerOpen && (
        <div
          onClick={() => {
            setIsDetailDrawerOpen(false);
            setCalDrawerEditMode(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.12)',
            backdropFilter: 'blur(1px)',
            zIndex: 999
          }}
        />
      )}

      {/* Right Drawer Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isDetailDrawerOpen ? 0 : '-400px',
          width: '360px',
          height: '100vh',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 1000,
          transition: 'right 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}
      >
        {selectedEvent && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Transaction Details</span>
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  setCalDrawerEditMode(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Drawer Body (Read-only / Edit-mode) */}
            {!calDrawerEditMode ? (
              // Display Mode
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client / Vendor</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedEvent.title}</div>
                </div>
                
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: selectedEvent.type.startsWith('receivable') ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                    {formatMoney(selectedEvent.amount)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</span>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: selectedEvent.type === 'receivable_one_time' ? '#e6f7ed' :
                                         selectedEvent.type === 'receivable_recurring' ? '#eff6ff' :
                                         selectedEvent.type === 'payable_one_time' ? '#fef2f2' : '#fff7ed',
                        color: selectedEvent.type === 'receivable_one_time' ? '#15803d' :
                               selectedEvent.type === 'receivable_recurring' ? '#1d4ed8' :
                               selectedEvent.type === 'payable_one_time' ? '#b91c1c' : '#c2410c',
                      }}>
                        {selectedEvent.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {selectedEvent.category.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                {selectedEvent.notes && (
                  <div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notes / Invoice</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '4px', backgroundColor: 'var(--bg-input)', padding: '8px', borderRadius: '6px' }}>
                      {selectedEvent.notes}
                    </div>
                  </div>
                )}
                
                {/* Actions Block */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedEvent.type === 'receivable_one_time' && selectedEvent.status === 'unpaid' && (
                      <button
                        onClick={() => {
                          updateReceivable(selectedEvent.id, { status: 'paid' });
                          setIsDetailDrawerOpen(false);
                        }}
                        className="btn-pill btn-pill-primary"
                        style={{ flex: 1, padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                      >
                        Mark Collected
                      </button>
                    )}
                    {selectedEvent.type === 'payable_one_time' && selectedEvent.status === 'unpaid' && (
                      <button
                        onClick={() => {
                          updatePayable(selectedEvent.id, { status: 'paid' });
                          setIsDetailDrawerOpen(false);
                        }}
                        className="btn-pill btn-pill-primary"
                        style={{ flex: 1, padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setCalDrawerEditMode(true);
                        setCalDrawerFormName(selectedEvent.title);
                        setCalDrawerFormAmount(selectedEvent.amount.toString());
                        setCalDrawerFormDate(selectedEvent.date);
                      }}
                      className="btn-pill"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      Edit Transaction
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          if (selectedEvent.type === 'receivable_one_time') deleteReceivable(selectedEvent.id);
                          if (selectedEvent.type === 'payable_one_time') deletePayable(selectedEvent.id);
                          if (selectedEvent.type === 'receivable_recurring') deleteRecurringRevenue(selectedEvent.id);
                          if (selectedEvent.type === 'payable_recurring') deleteRecurringExpense(selectedEvent.id);
                          setIsDetailDrawerOpen(false);
                        }
                      }}
                      className="btn-pill"
                      style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode Form
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title / Name</span>
                  <input
                    type="text"
                    value={calDrawerFormName}
                    onChange={(e) => setCalDrawerFormName(e.target.value)}
                    className="input-premium"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '6px 10px', marginTop: '4px' }}
                  />
                </div>
                
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</span>
                  <input
                    type="number"
                    value={calDrawerFormAmount}
                    onChange={(e) => setCalDrawerFormAmount(e.target.value)}
                    className="input-premium"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '6px 10px', marginTop: '4px' }}
                  />
                </div>
                
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</span>
                  <input
                    type="date"
                    value={calDrawerFormDate}
                    onChange={(e) => setCalDrawerFormDate(e.target.value)}
                    className="input-premium"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '6px 10px', marginTop: '4px' }}
                  />
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button
                    onClick={() => {
                      const amountNum = parseFloat(calDrawerFormAmount);
                      if (!calDrawerFormName || isNaN(amountNum)) {
                        alert('Please enter a valid title and amount');
                        return;
                      }
                      if (selectedEvent.type === 'receivable_one_time') {
                        updateReceivable(selectedEvent.id, { client: calDrawerFormName, amount: amountNum, dueDate: calDrawerFormDate });
                      } else if (selectedEvent.type === 'payable_one_time') {
                        updatePayable(selectedEvent.id, { vendor: calDrawerFormName, amount: amountNum, dueDate: calDrawerFormDate });
                      } else if (selectedEvent.type === 'receivable_recurring') {
                        updateRecurringRevenue(selectedEvent.id, { clientName: calDrawerFormName, amount: amountNum, startDate: calDrawerFormDate });
                      } else if (selectedEvent.type === 'payable_recurring') {
                        updateRecurringExpense(selectedEvent.id, { expenseName: calDrawerFormName, amount: amountNum, startDate: calDrawerFormDate });
                      }
                      setIsDetailDrawerOpen(false);
                      setCalDrawerEditMode(false);
                    }}
                    className="btn-pill btn-pill-primary"
                    style={{ flex: 1, padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setCalDrawerEditMode(false)}
                    className="btn-pill"
                    style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Profile & Setting Modals */}
      {activeModal === 'profile' && (
        <UserProfileModal 
          userProfile={userProfile} 
          onSave={(updates) => {
            updateUserProfile(updates);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'company' && (
        <CompanyProfileModal 
          companyProfile={companyProfile} 
          onSave={(updates) => {
            updateCompanyProfile(updates);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'preferences' && (
        <PreferencesModal 
          userPreferences={userPreferences} 
          onSave={(updates) => {
            updateUserPreferences(updates);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'help' && (
        <HelpSupportModal 
          onClose={() => setActiveModal(null)}
        />
      )}
      {isSignOutConfirmOpen && (
        <SignOutConfirmModal 
          onClose={() => setIsSignOutConfirmOpen(false)}
          onConfirm={async () => {
            setIsSignOutConfirmOpen(false);
            if (isSupabaseConfigured()) {
              await supabase.auth.signOut();
              window.location.reload();
            } else {
              setBypassAuth(false);
              setSession(null);
            }
          }}
        />
      )}

      </main>

      {/* PRINTABLE ESTIMATE SHEET FOR CLIENT EXPORTS */}
      <div className="printable-estimate-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333333', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#111111' }}>PROJECT PRICING ESTIMATE</h1>
            <p style={{ fontSize: '12px', color: '#666666', margin: '4px 0 0 0' }}>Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{companyProfile.companyName}</h2>
            <p style={{ fontSize: '11px', color: '#666666', margin: '4px 0 0 0', maxWidth: '250px' }}>{companyProfile.companyAddress || 'Corporate Office'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666666', borderBottom: '1px solid #eeeeee', paddingBottom: '6px', margin: '0 0 8px 0' }}>Client Information</h3>
            <table style={{ width: '100%', border: 'none', margin: 0 }}>
              <tbody>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600, width: '100px' }}>Client Name:</td><td style={{ border: 'none', padding: '3px 0' }}>{projectEstimate.clientName}</td></tr>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600 }}>Region:</td><td style={{ border: 'none', padding: '3px 0' }}>{projectEstimate.clientRegion}</td></tr>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600 }}>Contract Type:</td><td style={{ border: 'none', padding: '3px 0', textTransform: 'capitalize' }}>{projectEstimate.contractType.replace('_', ' ')}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666666', borderBottom: '1px solid #eeeeee', paddingBottom: '6px', margin: '0 0 8px 0' }}>Estimate Summary</h3>
            <table style={{ width: '100%', border: 'none', margin: 0 }}>
              <tbody>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600, width: '140px' }}>Project Name:</td><td style={{ border: 'none', padding: '3px 0' }}>{projectEstimate.projectName}</td></tr>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600 }}>Estimated Hours:</td><td style={{ border: 'none', padding: '3px 0' }}>{projectEstimate.estimatedHours} hrs</td></tr>
                <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px 0', fontWeight: 600 }}>Delivery Timeline:</td><td style={{ border: 'none', padding: '3px 0' }}>{projectEstimate.deliveryTimelineDays} days</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 8px 0', borderBottom: '1.5px solid #111111', paddingBottom: '6px' }}>Workforce Resource Allocation</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 20px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Allocated Role</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Department</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>Hours Allocated</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>Headcount</th>
            </tr>
          </thead>
          <tbody>
            {allocatedResources.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ border: '1px solid #dddddd', padding: '12px', textAlign: 'center', color: '#666666' }}>No team members allocated.</td>
              </tr>
            ) : (
              allocatedResources.map((res) => {
                const emp = employees.find(e => e.id === res.employeeId);
                return (
                  <tr key={res.id}>
                    <td style={{ border: '1px solid #dddddd', padding: '8px 12px' }}>{emp?.roleName || 'Unknown Role'}</td>
                    <td style={{ border: '1px solid #dddddd', padding: '8px 12px' }}>{emp?.department || 'N/A'}</td>
                    <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{res.allocatedHours} hrs</td>
                    <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{res.quantity}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 8px 0', borderBottom: '1.5px solid #111111', paddingBottom: '6px' }}>Financial Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 20px 0' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 600 }}>Workforce & Staffing Costs</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(metrics.simWorkforceCost)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 600 }}>Allocated Cloud Infrastructure</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(metrics.simInfraCost)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 600 }}>Allocated SaaS Licensing & AI Tools</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(metrics.simSaaSCost)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 600 }}>Shared Operations & Overheads</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(metrics.simOverheadCost)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 700 }}>Total Project Cost Burden</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{formatMoney(metrics.simOperationalCost)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', fontWeight: 600 }}>Contingency Buffer ({projectEstimate.contingencyPercent}%)</td>
              <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(metrics.simContingencyCost)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f0fdf4', color: '#14532d' }}>
              <td style={{ border: '1px solid #dddddd', padding: '10px 12px', fontWeight: 800, fontSize: '14px' }}>Recommended Quotation</td>
              <td style={{ border: '1px solid #dddddd', padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: '14px' }}>{formatMoney(metrics.simRecommendedQuote)}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 8px 0', borderBottom: '1.5px solid #111111', paddingBottom: '6px' }}>Project Milestone & Cash Flow Payouts</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 20px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Milestone Payout Details</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>Payout Percentage</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>Payout Amount</th>
              <th style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>Expected Cash Delay</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((ms) => {
              const amount = metrics.simRecommendedQuote * (ms.percentage / 100);
              return (
                <tr key={ms.id}>
                  <td style={{ border: '1px solid #dddddd', padding: '8px 12px' }}>{ms.name}</td>
                  <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'center' }}>{ms.percentage}%</td>
                  <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{formatMoney(amount)}</td>
                  <td style={{ border: '1px solid #dddddd', padding: '8px 12px', textAlign: 'right' }}>{ms.paymentDelayDays} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: '48px', borderTop: '1px solid #dddddd', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666666' }}>
          <span>Confidentiality Notice: This document contains proprietary pricing parameters of {companyProfile.companyName}.</span>
          <span>Verified by PIOS Engine</span>
        </div>
      </div>

      {/* Rotating animation spin styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
