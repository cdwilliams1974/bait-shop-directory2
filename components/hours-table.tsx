import { Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Hours {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_24h: boolean;
  is_closed: boolean;
}

interface HoursTableProps {
  hours: Hours[];
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function formatTime(time: string | null): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getHoursText(day: Hours): string {
  if (day.is_closed) return 'Closed';
  if (day.is_24h) return 'Open 24 Hours';
  if (day.open_time && day.close_time) {
    return `${formatTime(day.open_time)} - ${formatTime(day.close_time)}`;
  }
  return 'Hours not available';
}

function isCurrentDay(weekday: number): boolean {
  return new Date().getDay() === weekday;
}

export function HoursTable({ hours }: HoursTableProps) {
  const sortedHours = [...hours].sort((a, b) => a.weekday - b.weekday);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Hours of Operation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHours.map((day) => {
              const isCurrent = isCurrentDay(day.weekday);
              return (
                <TableRow
                  key={day.weekday}
                  className={isCurrent ? 'bg-muted/50' : ''}
                >
                  <TableCell className={isCurrent ? 'font-semibold' : ''}>
                    {WEEKDAYS[day.weekday]}
                    {isCurrent && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Today)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={isCurrent ? 'font-semibold' : ''}>
                    {getHoursText(day)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
