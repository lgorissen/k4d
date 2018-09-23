# 11. DaemonSet - one Pod on each Node

A DaemonSet ensures that on each cluster Node runs a copy of a Pod - also when nodes are added/removed from the Cluster.
This functionality is mostly used for Pods that perform infrastructure related tasks on a Node level, e.g. log file collection.
As an additional feature, nodes can also be selected using the ***nodeSelector*** feature. Thus, a DaemonSet can run Pods on a subset of Nodes in the Cluster.


## DaemonSet example

Our example will run a Pod on all nodes with node label **gpu** set to **high**. Think of the Pod as a 'monitor of the Node's GPU capability'.

The DaemonSet manifest file (in the lab 11 directory, name `daemonset-gpu.yaml`):

```bash
apiVersion: apps/v1beta2    # mind the API version
kind: DaemonSet             # type DaemonSet
metadata:
  name: gpu-monitor-ds      # name of DaemonSet
spec:
  selector:                 # label selector for counting Daemon Pods
    matchLabels:
      app: gpu-monitor      
  template:                 # Pod template
    metadata:
      labels:
        app: gpu-monitor    # Pod label
    spec:
      nodeSelector:         # new: nodeSelector
        gpu: high           # only Nodes with label 'gpu: high'
      containers:
      - name: main
        image: lgorissen/gpu-monitor
```

The container `lgorissen/gpu-monitor` that is defined writes a message 'GPU OK' to the log, every 5 seconds.

Now, create the DaemonSet (manifest file 'daemonset-gpu.yaml' in the lab 11 directory):

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k create -f daemonset-gpu.yaml 
daemonset.apps/gpu-monitor-ds created
developer@developer-VirtualBox:~/projects/k4d/lab 11$ 
```
.. and check for the Pod:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k get pod
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 11$
```
The Pod is not there because the minikube node does not have the label `gpu=high`:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k get node minikube --show-labels 
NAME       STATUS    ROLES     AGE       VERSION   LABELS
minikube   Ready     master    6d        v1.10.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/hostname=minikube,node-role.kubernetes.io/master=
developer@developer-VirtualBox:~/projects/k4d/lab 11$
```

Now we know that the NodeSelector does its job. Let's add the `gpu=high` label to the minikube node and then check if the DaemonSet started the Pod:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k get pod
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k label node minikube gpu=high
node/minikube labeled
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k get node minikube --show-labels 
NAME       STATUS    ROLES     AGE       VERSION   LABELS
minikube   Ready     master    6d        v1.10.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,gpu=high,kubernetes.io/hostname=minikube,node-role.kubernetes.io/master=
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k get pod
NAME                   READY     STATUS    RESTARTS   AGE
gpu-monitor-ds-j6h59   1/1       Running   0          9s
developer@developer-VirtualBox:~/projects/k4d/lab 11$ k logs gpu-monitor-ds-j6h59 
GPU OK
GPU OK
GPU OK
GPU OK
developer@developer-VirtualBox:~/projects/k4d/lab 11$
```

Clean up!

