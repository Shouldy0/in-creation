import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: it });
} 
