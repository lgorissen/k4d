# 13. CronJob - a periodically running Job

The official definition is that ***a Cron Job creates Jobs on a time-based schedule***.

Well, there isn't much more to it. It is pretty similar to running cron(tab) jobs on your Linux machine. Nevertheless, a fair warning should be given: please look up the Kubernetes specification of the CronJob. It lists some limitations, mainly arround the accuracy of the whole Kubernetes timing mechanism.

The CronJob needs to be scheduled, which is defined in the spec part of the template. For the spec.schedule, the Kubernetes specs refer to the wiki definition: https://en.wikipedia.org/wiki/Cron

Most important is to understan the schedule string (copied from the above wiki page):

```
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of the month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday;
# │ │ │ │ │                                   7 is also Sunday on some systems)
# │ │ │ │ │
# │ │ │ │ │
# * * * * * command to execute
```

## CronJob example

Our example uses our container `lgorissen/terra10-job` that was specified in the `lab 12` directory. Upon start, it prints a message to the console and then sleeps for 120 seconds. Then it prints another message to the console and terminates.

The manifest file for our CronJob example (file `terra10-cronjob.yaml` in lab 13 directory):

```bash
apiVersion: batch/v1beta1
kind: CronJob                            # resource type is CronJob
metadata:
  name: terra10-cronjob-10min
spec:
  schedule: "0,10,20,30,40,50 * * * *"   # job runs every 10 minutes
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: terra10-cronjob         # label for Pods
        spec:
          restartPolicy: OnFailure
          containers:
          - name: main
            image: lgorissen/terra10-job
```

Well, there is hardly any surprise in that. Run it!

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 13$ kubectl create -f terra10-cronjob.yaml 
cronjob.batch/terra10-cronjob-10min created
developer@developer-VirtualBox:~/projects/k4d/lab 13$ kubectl get cronjobs
NAME                    SCHEDULE                   SUSPEND   ACTIVE    LAST SCHEDULE   AGE
terra10-cronjob-10min   0,10,20,30,40,50 * * * *   False     0         <none>          9s
developer@developer-VirtualBox:~/projects/k4d/lab 13$ kubectl get pod
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 13$
```
So, the CronJob is started, but so far no Pods. We have to wait for the first timing moment ... and then a Pod is started:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl get cronjobs terra10-cronjob-10min 
NAME                    SCHEDULE                   SUSPEND   ACTIVE    LAST SCHEDULE   AGE
terra10-cronjob-10min   0,10,20,30,40,50 * * * *   False     1         48s             10m
developer@developer-VirtualBox:~/projects/k4d$ kubectl get pod
NAME                                     READY     STATUS    RESTARTS   AGE
terra10-cronjob-10min-1537725600-85bwk   1/1       Running   0          48s
developer@developer-VirtualBox:~/projects/k4d$
```

And when that first Pod has completed...:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl get cronjob
NAME                    SCHEDULE                   SUSPEND   ACTIVE    LAST SCHEDULE   AGE
terra10-cronjob-10min   0,10,20,30,40,50 * * * *   False     0         2m              12m
developer@developer-VirtualBox:~/projects/k4d$ kubectl get pod
NAME                                     READY     STATUS      RESTARTS   AGE
terra10-cronjob-10min-1537725600-85bwk   0/1       Completed   0          2m
developer@developer-VirtualBox:~/projects/k4d$ kubectl logs terra10-cronjob-10min-1537725600-85bwk 
Sun Sep 23 18:00:06 UTC 2018 Work started at Terra10
Sun Sep 23 18:02:06 UTC 2018 Work finished at Terra10 - have a beer!
developer@developer-VirtualBox:~/projects/k4d$
```

Clean up!

Ain't it great when simple things can be done with simple solutions?

