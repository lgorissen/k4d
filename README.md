# K4D - Kubernetes for Developers

This archive has the labs for a Terra10 internal training for Kubernetes. Its goal is to let application developers become familiar with Kubernetes. 

The training is intended as a first step to prepare the participants for the **'Kubernetes Application Developer' certification**. After going through this training, the participants are **NOT ready** to do the Kubernetes Application Developer certification. However, the participants will be able to complete studying for the certification at a much quicker pace...

The material in this training is highly inspired by the book [Kubernetes in Action](https://www.manning.com/books/kubernetes-in-action) by Marko Luksa. If you need further studying material ... **BUY THAT BOOK**.

The labs in this archive cover the following topics:

|Nr | Category  | Lab                          | Description                                   |
|---|-----------|------------------------------|-----------------------------------------------|
|1  | Setup     | Preparing the environment    | Install the minikube Kubernetes environment   |
|2  | Example   | Run that app on Kubernetes   | Run a container in a Kubernetes Pod           |
|3  | Pod       | Scale and monitor that Pod!  | Use a ReplicationController for scaling your app|
|4  | Pod       | Pods and YAML (and JSON) (and Logs) | Create a Pod from a manifest file      |
|5  | Labels    | Pods and labels              | Organize your Pods with Labels                |
|6  | Namespace | Kubernetes Namespaces: even more organisation | Logical partitioning of your Cluster |
|7  | Kubectl   | Cleaning up                  | Avoid a mess on your minikube ;-)             |
|8  | Probes    | Docter, docter! My Pod is ill... (Probes) | Readiness and Liveness Probes    |
|9  | Controller| Replication Controllers      | Ensuring that your Pods are always there      |
|10 | Controller| Replication Sets             | A ... modern Replication Controller           |
|11 | Controller| DaemonSet - one Pod on each Node | great title                               |
|12 | Controller| Job - a Pod that terminates  | Let a Pod do a single task                    |
|13 | Controller| CronJob - a periodically running Job | Timing when the Pod is executed       |
|14 | Services  | Expose your ... Pod          | Access Pods via a Service (ClusterIP, NodePort, LoadBalancer and Ingress) |
|15 | Services  | Access a service via DNS     | Kubernetes DNS for accessing Services and Pods|               
|16 | Services  | Endpoint: external services  | Access external services via an Endpoint      |
|17 | Services  | Headless Service: point-to-multipoint | Finding/addressing all Pods behind a Service |
|18 | Volumes   | Volume emptyDir | Share data between Pods using a Volume |
|19 | Volumes   | Volume hostPath | Worker Node file system |
|20 | Volumes   | Volume gitRepo  | Clones a Git repository into the mounted empty directory | 
|21 | Volumes   | Volume configMap | Inject configuration information in your Pod |
|22 | Volumes   | Volume configMap advanced | Handling config files and directories |
|23 | Volumes   | Volume secret | Passing sensitive information to Pods |
|24 | Volumes   | Volume downwardAPI | Accessing downward API data |
|25 | Volumes   | Persistent Volumes | Hiding tech details from the developer |
|26 | Volumes   | Dynamic Volume Provisioning | Hiding the developer from the administrator |
