# 9. Replication Controllers

I like ReplicationControllers. To me, they feel like they are at the core of what Kubernetes is about: ensuring that your containers are all up-and-running and sound.

**Definition**

In the Kubernetes reference manuals, the Replication Controller is described as:
'A ReplicationController ensures that a specified number of pod replicas are running at any one time. In other words, a ReplicationController makes sure that a pod or a homogeneous set of pods is always up and available.'

Aha! So, if I have a Kubernetes cluster with 2 nodes, and a Replication Controller that specifies that 3 Pods have to be up and running, that could look like:

<img src="img/lab9-rc-3-pods-OK.png" width="350px"/>

**Failures**

Now, in the previous lab, we saw that the kubelet can restart a container in a Pod when it is malfunctioning or crashed by using Liveness Probes. But ... when a complete Worker node crashes, the kubelet is also gone.

<img src="img/lab9-rc-3-pods-worker-gone.png" width="350px"/>

That is where the Replication Controller kicks in. The Replication Controller will then start the Pod(s) on the other Worker node.

<img src="img/lab9-rc-3-pods-worker-restarted.png" width="350px"/>

So, basically, the ReplicationController counts its Pods every now and then, and when the number of Pods does not match with the specified count, it will take action. 

**How does the Replication Controller work?**

The Replication Controller's main task is to ensure that the proper number of Pods is scheduled to the Cluster. It does so by regularly counting the number of Pods and compare the count with the number specified in the Replication Controller. If the count is too low, it will schedule new Pods. If the count is too high, it will stop Pods.
The counting mechanism is label based: the Replication Controller has a Label Selector (lab 05) that it uses for selecting (=counting) the Pods that match the Label Selector.

In a figure:

<img src="img/lab9-rc-label-selector.png" width="450px"/>


## 9.1 A simple Replication Controller

Time to get some hands-on experience. Remember in lab 02, we created a Replication Controller with the command `kubectl run terra10 --image=lgorissen/terra10 --port=8080 --generator=run/v1`. 

In this lab, however, we will use a manifest file for a Replication Controller:

```bash
apiVersion: v1
kind: ReplicationController       # type of resource
metadata:
  name: terra10-rc                # name
spec:
  replicas: 3                     # desired number of Pods
  selector:
    app: terra10                  # Label Selector for counting Pods
  template:                       # Pod specification starts here
    metadata:
      labels:                     # Pod labels
        app: terra10              # the label that is also used in the Label Selector
    spec:                         # start of Container specification
      containers:
      - name: terra10
        image: lgorissen/terra10
        ports:
        - containerPort: 8080
```
Note that in the manifest file the Label `app:terra10` appears twice. This leaves room for errors. There are 2 things you must know:

1. You don't have to specify a label selector. If you don't, Kubernetes will get the labels from the Pod specification
2. If the Label Selector and the Pod labels don't match, Kubernetes will not accept the Replication Controller manifest file

Now, we will use `kubectl` to create the Replication Controller. Note that we will not explicitly create Pods: the Replication Controller will do that :-) (the manifest file `terra10-rc.yaml` is in the lab 09 directory):
 
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl create -f terra10-rc.yaml 
replicationcontroller/terra10-rc created
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get rc
NAME         DESIRED   CURRENT   READY     AGE
terra10-rc   3         3         3         13s
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rc-4d4zf   1/1       Running   0          17s
terra10-rc-dqrw4   1/1       Running   0          17s
terra10-rc-jc5q4   1/1       Running   0          17s
developer@developer-VirtualBox:~/projects/k4d/lab 09$ 
```

**Replication Controller and failures**

When we simulate a failure by manually deleting one of the Pods, the Replication Controller should create a new Pod:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl delete pod terra10-rc-4d4zf 
pod "terra10-rc-4d4zf" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 09$
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get rc
NAME         DESIRED   CURRENT   READY     AGE
terra10-rc   3         3         3         6m
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get pod
NAME               READY     STATUS        RESTARTS   AGE
terra10-rc-4d4zf   1/1       Terminating   0          6m
terra10-rc-dqrw4   1/1       Running       0          6m
terra10-rc-jc5q4   1/1       Running       0          6m
terra10-rc-nxgsm   1/1       Running       0          7s
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rc-dqrw4   1/1       Running   0          7m
terra10-rc-jc5q4   1/1       Running   0          7m
terra10-rc-nxgsm   1/1       Running   0          35s
developer@developer-VirtualBox:~/projects/k4d/lab 09$
```

As expected, with a Terminating Pod present, the Replication Controller immediately starts a new Pod.

**Replication Controller and scaling**

A production environment could require at some point a higher - or lower - number of Pods. It is very easy to achieve that:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl scale rc terra10-rc --replicas=4
replicationcontroller/terra10-rc scaled
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rc-dqrw4   1/1       Running   0          28m
terra10-rc-jc5q4   1/1       Running   0          28m
terra10-rc-nxgsm   1/1       Running   0          21m
terra10-rc-vcxp6   1/1       Running   0          4s
developer@developer-VirtualBox:~/projects/k4d/lab 9$
```

Clean up the Replication Controller:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl delete rc terra10-rc 
replicationcontroller "terra10-rc" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get pod
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 09$ kubectl get rc
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 09$
```

If you would have wanted the Pods to stay alive, you should have used the command ` kubectl delete rc terra10-rc --cascade=false`.

