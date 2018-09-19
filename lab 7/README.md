# 7. Cleaning up 

*Even though I'm not that good at cleaning up ... I **will** ask you to do so*.

So far, we have created lots of Kubernetes objects: Pods, ReplicationController, Service, a Namespace, with and without labels. Now it is time to clean up before your loose track of what's going on in your minikube. 

<img src="img/lab7-broom.png" height="200"/>

Without much further ado...

** Delete a Pod **
Start simple by deleting the Pod named `terra10-simple`:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pod
NAME                    READY     STATUS    RESTARTS   AGE
terra10-gx6sr           1/1       Running   3          1d
terra10-playback-0340   1/1       Running   1          23h
terra10-playback-3542   1/1       Running   1          23h
terra10-playback-5674   1/1       Running   1          23h
terra10-qjdqv           1/1       Running   3          1d
terra10-record-2874     1/1       Running   1          23h
terra10-record-3899     1/1       Running   1          23h
terra10-record-4139     1/1       Running   1          23h
terra10-simple          1/1       Running   3          1d
terra10-z4lkv           1/1       Running   3          1d
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete pod terra10-simple 
pod "terra10-simple" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$
```
By listing the Pods again, verify that it is deleted.

** Delete Pods using a label selector **
Remember the labels we introduced in lab 4? Let's delete all Pods with label 'microservice'  set to 'playback' :

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pod -l microservice=playback
NAME                    READY     STATUS    RESTARTS   AGE
terra10-playback-0340   1/1       Running   1          23h
terra10-playback-3542   1/1       Running   1          23h
terra10-playback-5674   1/1       Running   1          23h
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete pod -l microservice=playback
pod "terra10-playback-0340" deleted
pod "terra10-playback-3542" deleted
pod "terra10-playback-5674" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$
```
Again, verify by listing the Pods again

** Delete a ReplicationContoller (and ...)**
We created a ReplicationController named `terra10` that controls 3 Pods that have a name of format `terra10-nnnn`:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get rc
NAME      DESIRED   CURRENT   READY     AGE
terra10   3         3         3         1d
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pods
NAME                  READY     STATUS    RESTARTS   AGE
terra10-gx6sr         1/1       Running   3          1d
terra10-qjdqv         1/1       Running   3          1d
terra10-record-2874   1/1       Running   1          23h
terra10-record-3899   1/1       Running   1          23h
terra10-record-4139   1/1       Running   1          23h
terra10-z4lkv         1/1       Running   3          1d
```
Deleting the ReplicationController will also delete the Pods that the ReplicationController is managing:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete rc terra10 
replicationcontroller "terra10" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pod
NAME                  READY     STATUS    RESTARTS   AGE
terra10-record-2874   1/1       Running   1          23h
terra10-record-3899   1/1       Running   1          23h
terra10-record-4139   1/1       Running   1          23h
developer@developer-VirtualBox:~/projects/k4d/lab 7
```

** Delete a namespace **
By now, you can guess how to delete a namespace. But did you realize that deleting a namespace also removes all the Kubernetes objects in that namespace?
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pod -n terra10-namespace 
NAME             READY     STATUS    RESTARTS   AGE
terra10-simple   1/1       Running   0          41m
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete namespaces terra10-namespace 
namespace "terra10-namespace" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pod -n terra10-namespace 
No resources found.
developer@developer-VirtualBox:~/projects/k4d/lab 7$
```
Be careful!


** Delete a service **
Now we do have one 'dangling' service named `terra10-http`. Dangling because the Pods that it refers to are already deleted... Now it's also time for the service to go:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get service
NAME           TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
kubernetes     ClusterIP      10.96.0.1       <none>        443/TCP          3d
terra10-http   LoadBalancer   10.98.245.159   <pending>     8080:30712/TCP   1d
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete service terra10-http 
service "terra10-http" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$
```
Nice

** Any Pods left?**

There is a way to remove all Pods from a namespace:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k get pods
NAME                  READY     STATUS    RESTARTS   AGE
terra10-record-2874   1/1       Running   1          23h
terra10-record-3899   1/1       Running   1          23h
terra10-record-4139   1/1       Running   1          23h
developer@developer-VirtualBox:~/projects/k4d/lab 7$ k delete pod --all
pod "terra10-record-2874" deleted
pod "terra10-record-3899" deleted
pod "terra10-record-4139" deleted
developer@developer-VirtualBox:~/projects/k4d/lab 7$ 
```
Opgeruimd staat netjes.
