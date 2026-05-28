// ThemeToggle.js
import { useTheme } from '../context/ThemeContext';
import * as Toggle from '@radix-ui/react-toggle';
import { SunIcon, MoonIcon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === 'dark';

    return (
        <Toggle.Root
            pressed={isDark}
            onPressedChange={toggleTheme}
            className="ToggleRoot"
            aria-label="Toggle dark mode"
        >
            {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} /> }
        </Toggle.Root>
    );
};

export default ThemeToggle;