import React from 'react';
import { Star } from 'lucide-react';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    CircleCheckIcon,
    DownloadIcon,
    KebabIcon,
    PaperclipIcon,
    PrintIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

export function TransactionDockIcon({ icon }) {
    switch (icon) {
        case 'form':
            return <NavigationIcon type="form" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'document':
            return <NavigationIcon type="document" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'printer':
        case 'print':
            return <PrintIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'paperclip':
            return <PaperclipIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'star':
            return <Star className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'kebab':
            return <KebabIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'check':
            return <CircleCheckIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'trash':
            return <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'download':
            return <DownloadIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'save':
        default:
            return <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
    }
}
