use versions;
#数据库表字段含义参照 数据库表设计.md
CREATE TABLE versions(
	bank_name varchar(50),
    bank_id varchar(20),
    ver varchar(20),
    update_time date,
    feature varchar(255),
    func varchar(20),
    chg varchar(20),
    special varchar(50),
    analysis varchar(100),
    ctpart varchar(100),
    genre varchar(20),
    target varchar(100),
    log_time date,
    user_name varchar(20),
    PRIMARY KEY(bank_id,ver,feature)
);

create table summary(
	bank_name char(50),
    ver char(20),
    update_time date,
    item varchar(100),
    primary key(bank_name, ver)
    );

create table imags(
	id int unsigned,
	imgpath varchar(256),
	primary key(id,imgpath)
);
