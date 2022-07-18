path = '../util/591_Detect_log.txt'
file = open(path, 'r')
mail_meta_count = 0
mail_meta = []
for line in file.readlines():
    print(line)
    mail_meta.append(line)
    mail_meta_count += 1
    if(mail_meta_count > 4):
        break
file.close()
file = open(path, 'w')

file.truncate()

for line in mail_meta:
    file.write(line)


file.close()