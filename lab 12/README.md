# 12. Job - a Pod that terminates

A Job creates one or more Pod(s) that will perform their task(s) and then terminate. 

The Job will start a new Pod if the first Pod fails or is deleted. Similar to a Replication Controller, upon Node failure a non-terminated Job Pod will be started on another Node.


## 12.1 Job example - simple

Our example uses a container named `lgorissen/terra10-job`. Upon start, it prints a message to the console and then sleeps for 120 seconds. Then it prints another message to the console and terminates.

Let's first start with a simple Job (manifest file `terra10-job.yaml` in lab 12 directory):

```bash
apiVersion: batch/v1
kind: Job                              # resource type is Job
metadata:
  name: terra10-batch-job              # name of the Job
spec:                                  # the Job spec
  template:
    metadata:
      labels:
        app: terra10-job               # selector will be auto-created with this label
    spec:
      restartPolicy: OnFailure         # restartPolicy only OnFailure (default: Always)
      containers:
      - name: main
        image: lgorissen/terra10-job
```

Run it, and observe what happens:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl create -f terra10-job.yaml 
job.batch/terra10-batch-job created
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs.batch terra10-batch-job 
NAME                DESIRED   SUCCESSFUL   AGE
terra10-batch-job   1         0            18s
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pod
NAME                      READY     STATUS              RESTARTS   AGE
terra10-batch-job-ls476   0/1       ContainerCreating   0          3s
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl logs terra10-batch-job-ls476 
Sun Sep 23 16:52:10 UTC 2018 Work started at Terra10
developer@developer-VirtualBox:~/projects/k4d/lab 12$
```
So, it is clear that the job started. After some 2 minutes, let's check again what happened:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs.batch 
NAME                DESIRED   SUCCESSFUL   AGE
terra10-batch-job   1         1            4m
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pod
NAME                      READY     STATUS      RESTARTS   AGE
terra10-batch-job-ls476   0/1       Completed   0          4m
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl logs terra10-batch-job-ls476 
Sun Sep 23 16:52:10 UTC 2018 Work started at Terra10
Sun Sep 23 16:54:10 UTC 2018 Work finished at Terra10 - have a beer!
developer@developer-VirtualBox:~/projects/k4d/lab 12$ 
```
The above shows that the job is marked `SUCCESSFUL`, the Pod has status `Completed` and the Pods log file confirms that the Pod ran the whole Job...

Clean up!

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl delete job terra10-batch-job 
job.batch "terra10-batch-job" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pod
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 12$ 
```
Note that deleting the Job also deletes the corresponding Pods.


## 12.2 Job example - multiple Pods in a Job

The Job manifest definition allows you to specify that you want to run multiple Pods in one single Job. It even allows you to specify how many Pods are allowed to run in parallel.

Let's have a look at a sample Job manifest file (lab 12 directory, named `terra10-multiple-job.yaml`):

```bash
apiVersion: batch/v1
kind: Job
metadata:
  name: terra10-multiple-job
spec:
  completions: 5               # Job consists of 5 completed Pod instances
  parallelism: 2               # ... and max 2 Pod instances will run in parallel
  template:
    metadata:
      labels:
        app: terra10-job
    spec:
      restartPolicy: OnFailure
      containers:
      - name: main
        image: lgorissen/terra10-job

```

Run it, and spend some time to observe what's going on:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl create -f terra10-multiple-job.yaml 
job.batch/terra10-multiple-job created
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs
NAME                   DESIRED   SUCCESSFUL   AGE
terra10-multiple-job   5         0            3s
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pods
NAME                         READY     STATUS    RESTARTS   AGE
terra10-multiple-job-5m74c   1/1       Running   0          8s
terra10-multiple-job-jdss5   1/1       Running   0          8s
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl logs terra10-multiple-job-5m74c 
Sun Sep 23 17:27:46 UTC 2018 Work started at Terra10
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl logs terra10-multiple-job-jdss5 
Sun Sep 23 17:27:47 UTC 2018 Work started at Terra10
developer@developer-VirtualBox:~/projects/k4d/lab 12$
```

All started great. Wait for the first 2 Pods to complete...

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs terra10-multiple-job 
NAME                   DESIRED   SUCCESSFUL   AGE
terra10-multiple-job   5         2            2m
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pods
NAME                         READY     STATUS      RESTARTS   AGE
terra10-multiple-job-5m74c   0/1       Completed   0          2m
terra10-multiple-job-fdf5m   1/1       Running     0          11s
terra10-multiple-job-jdss5   0/1       Completed   0          2m
terra10-multiple-job-qs867   1/1       Running     0          13s
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl logs terra10-multiple-job-5m74c 
Sun Sep 23 17:27:46 UTC 2018 Work started at Terra10
Sun Sep 23 17:29:46 UTC 2018 Work finished at Terra10 - have a beer!
developer@developer-VirtualBox:~/projects/k4d/lab 12$ 
```
Great: the next 2 Pods are now started. Wait again for another 2 minutes:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs terra10-multiple-job 
NAME                   DESIRED   SUCCESSFUL   AGE
terra10-multiple-job   5         4            4m
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pods
NAME                         READY     STATUS      RESTARTS   AGE
terra10-multiple-job-5m74c   0/1       Completed   0          4m
terra10-multiple-job-fdf5m   0/1       Completed   0          2m
terra10-multiple-job-jdss5   0/1       Completed   0          4m
terra10-multiple-job-qs867   0/1       Completed   0          2m
terra10-multiple-job-tx9wm   1/1       Running     0          6s
developer@developer-VirtualBox:~/projects/k4d/lab 12$
```
Now also the fifth and last Pod is started. Wait also for this one to complete:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get jobs terra10-multiple-job 
NAME                   DESIRED   SUCCESSFUL   AGE
terra10-multiple-job   5         5            6m
developer@developer-VirtualBox:~/projects/k4d/lab 12$ kubectl get pods
NAME                         READY     STATUS      RESTARTS   AGE
terra10-multiple-job-5m74c   0/1       Completed   0          6m
terra10-multiple-job-fdf5m   0/1       Completed   0          4m
terra10-multiple-job-jdss5   0/1       Completed   0          6m
terra10-multiple-job-qs867   0/1       Completed   0          4m
terra10-multiple-job-tx9wm   0/1       Completed   0          2m
developer@developer-VirtualBox:~/projects/k4d/lab 12$
```

Job completed! Nifty.
 
Clean up!
