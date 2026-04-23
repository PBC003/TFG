import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { QuizAnalyticsQuestionStatsItem } from "../../../../types/quiz";
import { formatRawScore } from "../utils/quiz-analytics.utils";

type QuizAnalyticsQuestionStatsCardProps = {
  title: string;
  stats: QuizAnalyticsQuestionStatsItem[];
  labels: {
    question: string;
    attempts: string;
    correct: string;
    incorrect: string;
    unanswered: string;
    correctRate: string;
    averagePoints: string;
    getTypeLabel: (type: string) => string;
  };
};

export function QuizAnalyticsQuestionStatsCard({
  title,
  stats,
  labels,
}: QuizAnalyticsQuestionStatsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack spacing={0}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{labels.question}</TableCell>
                  <TableCell>{labels.attempts}</TableCell>
                  <TableCell>{labels.correct}</TableCell>
                  <TableCell>{labels.incorrect}</TableCell>
                  <TableCell>{labels.unanswered}</TableCell>
                  <TableCell>{labels.correctRate}</TableCell>
                  <TableCell>{labels.averagePoints}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.questionId} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={700}>
                          {stat.order}. {stat.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {labels.getTypeLabel(stat.type)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{stat.attempts}</TableCell>
                    <TableCell>{stat.correctCount}</TableCell>
                    <TableCell>{stat.incorrectCount}</TableCell>
                    <TableCell>{stat.unansweredCount}</TableCell>
                    <TableCell>{stat.correctRate}%</TableCell>
                    <TableCell>
                      {formatRawScore(stat.averageEarnedPoints, stat.maxPoints)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
