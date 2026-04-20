import { useState, useEffect, memo } from 'react';
const cn = (...classes) => classes.filter(Boolean).join(' ');
const ImpactCounter = memo(({
  value = 0,       
  label,           
  suffix = '',     
  prefix = '',     
  duration = 1500, 
  color = 'emerald',
  icon: Icon,
  loading = false,
}) => {

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!value || value === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (value - startValue) * eased);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        
        setDisplayValue(value);
      }
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  icon: 'text-orange-500'  },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-500'    },
    purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  icon: 'text-purple-500'  },
  };

  const { bg, text, icon: iconColor } = colorMap[color] || colorMap.emerald;

  if (loading) {
    return (
      <div className={cn('rounded-2xl p-6 text-center animate-pulse', bg)}>
        <div className="h-10 w-24 bg-white/60 rounded-lg mx-auto mb-2" />
        <div className="h-4 w-20 bg-white/60 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl p-6 text-center', bg)}>
      {Icon && (
        <div className="flex justify-center mb-3">
          <Icon className={cn('h-7 w-7', iconColor)} />
        </div>
      )}
      <p className={cn('text-3xl font-extrabold tabular-nums', text)}>
        {prefix}{displayValue.toLocaleString('en-IN')}{suffix}
      </p>
      <p className={cn('text-sm font-medium mt-1 opacity-80', text)}>{label}</p>
    </div>
  );
});

ImpactCounter.displayName = 'ImpactCounter';

export default ImpactCounter;