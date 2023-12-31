"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { calculateTimeDifference } from "@/utils/timecalculator";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Streak {
  _id: string;
  streakname: string;
  description: string;
  maxdays: number;
  isstarted: boolean;
  startdate: string;
}
interface DurationData {
  days: number;
  duration: string;
  months: number;
  years: number;
}

export default function StreakCard({ streak }: { streak: Streak }) {
  const queryClient = useQueryClient();
  const [iscompleted, setIscompleted] = useState<boolean>(false);
  const [durationcal, setDurationcal] = useState<DurationData>({
    days: 0,
    duration: "",
    months: 0,
    years: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    async function duration(streak: Streak) {
      if (streak.isstarted) {
        const duro = calculateTimeDifference(streak.startdate);
        setDurationcal(duro);
      }
    }
    duration(streak);
  }, [streak]);

  // completion checkup
  // useEffect(() => {
  //   async function calculateCompletion(
  //     streak: Streak,
  //     durationcal: DurationData
  //   ) {
  //     if (durationcal.days === streak.maxdays) {

  //       setIscompleted(true);
  //     }
  //   }
  //   calculateCompletion(streak, durationcal);
  // }, [streak, durationcal]);

  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["x-auth-token"] = token;
  }

  // Streak start function
  const { isLoading, mutate } = useMutation<void, Error, string>(
    async id =>
      axios.patch(
        `https://zemo-backend.vercel.app/api/streaks/start/${id}`,
        { startdate: new Date().toLocaleString() },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast({
          title: "Streak Started Successfully",
          description: "Here You Go🚀",
          duration: 5000,
        });
      },
      onError: error => {
        toast({
          title: "Unable to Start the Streak",
          variant: "destructive",
        });
      },
    }
  );

  // Delete functionality
  const handleDelete = async (id: string) => {
    const response = await fetch(
      `https://zemo-backend.vercel.app/api/streak/delete/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );
    const result = await response.json();
    if (result.message === "Streak Deleted Successfully!") {
      queryClient.invalidateQueries();
      toast({
        title: result.message,
        description: "Don't forget to comeback again!",
        duration: 3000,
      });
    } else if (result.message === "error occured") {
      toast({
        title: result.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card className="bg-slate-100">
        <CardHeader>
          <CardTitle>{streak.streakname}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <CardDescription>
            <>
              <span className="capitalize mb-2">{streak.description}</span>
              <br />
              <span className="text-lg font-medium">{`Target:${streak.maxdays} Days`}</span>
            </>
          </CardDescription>
          <div className="flex flex-col gap-y-3 justify-center sm:flex-row gap-x-3 ">
            {!streak.isstarted && (
              <Button
                disabled={isLoading}
                className="mr-4"
                onClick={() => mutate(streak._id)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    <span>starting</span>
                  </>
                ) : (
                  <span>Start</span>
                )}
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger>Delete</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the streak.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(streak._id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
        <CardFooter>
          {streak.isstarted && durationcal.days < 1 && (
            <p className="text-sm text-green-700 font-semibold">
              {`Started: ${durationcal.duration}`}
            </p>
          )}
          {streak.isstarted && durationcal.days > 1 && (
            <p className="text-sm text-green-700 font-semibold">
              Days Completed: <span>{durationcal.days}</span>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
