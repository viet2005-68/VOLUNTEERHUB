--
-- PostgreSQL database dump
--

\restrict 4Bpbne7K7XEcfptKKRfiu7NjqRAjoKbMqa5EE9dRyTpAQHYEmG1sSqkHW0Nsrr4

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    roles character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    username character varying(255) NOT NULL,
    CONSTRAINT users_roles_check CHECK (((roles)::text = ANY ((ARRAY['USER'::character varying, 'ADMIN'::character varying, 'MANAGER'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO admin;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, created_at, email, name, password_hash, roles, updated_at, username) FROM stdin;
2e61fb95-774e-455e-a788-b36e506089a1	2025-11-27 23:24:16.982651	hieu@example.com	Nguyen Van Hieu	$2a$10$fRgoWnVbP/RakmwpcM7Zx.42FNFGFJ4OsjAU.8Vc9F4u0lO7Hen3q	USER	2025-11-27 23:24:16.983591	hieudev
60ff0fcc-b202-4fa3-ad2e-f7babb5786af	2025-11-28 15:04:58.343728	hieu@examle.com	Nguyen Van Hieu	$2a$10$mOcmwmhkTnjqUvRjakihJuVnPlB4FzHPLAhoE7gjVv6a2OEWhL.96	USER	2025-11-28 15:04:58.344728	hieudevJ
5568c10e-908d-46a2-9fe3-000b02814671	2025-11-28 18:06:16.634841	23020170@vnu.edu.vn	dfadsf	$2a$10$8Tw5Jc1a9T.4vwWAzvHAHuJY/ePDNEWknUBFst42i94R0C5ArjqtG	USER	2025-11-28 18:06:16.634841	vietthdn123@gmail.com
f69b5dc9-06a2-4fa9-a232-413c4ed98db9	2025-11-28 18:26:09.934935	23020170@gmail.com	dfadsf	$2a$10$7Yj1LKYUVEpyyYg272jafOjU2Un5x0PJFxiIwt6jjOOnkpIi3o3eW	USER	2025-11-28 18:26:09.938937	vietthdn12
8af3f321-4038-4726-810f-baf820addefe	2025-11-28 18:30:12.131594	23020170@gmail.xn--comsf-8ya	dfadsf	$2a$10$W88bFZq83/BIzCifdRy04uDVLVSxQ2WhebsKGfIbQA7Ey58oKAD2q	USER	2025-11-28 18:30:12.131594	vietthdn12sdf
d2de729b-cc31-4d88-8709-28e5dbf8f3d6	2025-11-28 18:34:24.499154	23020170@gmail.xn--comsfdf-lwa44b	dfadsf	$2a$10$4opgAAobmj8YvjFYI5QFhO.p5uuK1L0sM15xbw6VTcVtGiHeDnbJa	USER	2025-11-28 18:34:24.502165	vietthdn12sdfadsf
cac07287-3d34-4568-a5f5-cfea5e868acb	2025-11-28 18:36:49.127074	23020170@gmail.xn--comsfdfsada-o7a63d	dfadsf	$2a$10$FemgHWBT/SKCpkHmrKfiQevf7UO/gZJWXeEfgoy31n0g87jOi085W	USER	2025-11-28 18:36:49.127074	vietthdn12sdfadsfs
7ee2c77a-b2ed-469d-9f42-6e8bb5df974a	2025-11-28 18:43:38.135592	vietthdn201@gmail.com	Nguyen Hoang Viet	$2a$10$X.7lQ9CqwmKWf7U7KIgnsuqAfXDeuQu8cirg0pm9RH4qL50Rpo3eK	USER	2025-11-28 18:43:38.135592	volunteer
19eaf781-49f2-4364-b56a-4a9429d11a21	2025-11-28 18:44:26.046209	vietthdn201ds@gmail.com	Nguyen Hoang Viet	$2a$10$UhOC8hJek/S1KeuDLN7ST.G2jhO1KnYJ5ovV2ZeIBe.qQtxpDD6c6	USER	2025-11-28 18:44:26.046209	admin
b440d9b5-d225-47fc-898f-e9eb7896fa3f	2025-11-28 18:45:59.651339	vietthdn201ds@gdmail.com	Nguyen	$2a$10$SKxNuwIH9oeCrpSbks.9xu1KoVPeVuFIHnuafpu4RdUazWiB/6ZLO	USER	2025-11-28 18:45:59.651339	adminn
6a6eeda8-f41e-43e6-bb97-d6bd2491eda5	2025-11-28 18:50:47.753246	adminn@gmail.com	Nguyen Hoang Viet	$2a$10$xefFnSYvzGaF/Q8diBkSHulqsMW99E1T7nn/FbwrIdJSZZZg339p6	USER	2025-11-28 18:50:47.754292	adminnn
5344a0a6-074f-4c3e-8c84-bb705bcf499a	2025-11-28 19:13:21.093092	admindsfsn@gmail.com	Nguyen Hoang Viet	$2a$10$MfuttyEm/FPbdFq6UtAssuO3O6XvJMWogHTPrJtfCJFtHSYwR0d92	USER	2025-11-28 19:13:21.093092	adminnam
de4050ff-5c12-41a1-bc36-29c06c276ada	2025-11-28 19:18:18.397182	admi@gmail.com	dfasdf	$2a$10$hWsBdTWO5rF6MR19UE9U7OFdHHf3fOLKH0MsedCGTUAWR/HE12ZjK	USER	2025-11-28 19:18:18.398181	23020170
e0b152ab-2fc1-4ad5-8754-45b2e845f88d	2025-11-28 20:12:09.173628	admdinn@gmail.com	dfadsf	$2a$10$nspTrMZIUSk6AWXGOVpxROy1lFUmbk60jdhI6qIANlC1lDk3Ci2Nu	USER	2025-11-28 20:12:09.174605	23020175
c964d466-e9ae-415a-9c49-e200ae33131f	2025-11-28 22:34:30.017268	admindsfsdsn@gmail.com	Nguyen Hoang Viet	$2a$10$BIr.UaMPRIBIbrDFZl8Du.uTdPkPf1XqxitHmmRGW8VhONFK03nQO	USER	2025-11-28 22:34:30.017268	vietdeptrai
fa4aa6d6-b278-4f1c-a923-0107209f02c8	2025-11-28 22:38:45.511778	vietthdn2005@gmail.com	Nguyen Hoang Viet	$2a$10$9cyloZrIT3ZFnWlYw/OzsOwvIkU8Nk9E2Th2VVP50o6SV/gjwgqZi	USER	2025-11-28 22:38:45.514181	vietdeptraidsfds
10563fae-50b0-4837-92e4-6c84af82b4ef	2025-11-28 22:44:45.127152	vietthdn@gmail.com	Nguyen Hoang Viet	$2a$10$uPfEA30fQYRTl7JO6dltqeik68fCBl7kqShznHNYnc4zDUlBZ7JHq	USER	2025-11-28 22:44:45.127152	vinhquamanh
bf761156-5219-4d81-8623-3de3b5cdbd95	2025-11-28 22:46:26.127496	vietthdnsdf@gmail.com	Hoang Thanh Vinh	$2a$10$JaBX47mzgwr7CnkbP4i41eASLUQYjGwjU4QT4B0ZRhv6diEZ71ywu	USER	2025-11-28 22:46:26.127496	23020170HoangVinh
2751d11d-b835-4fd5-ae3a-1a5108532bd3	2025-11-28 22:47:57.053533	vietthdnsakd@gmail.com	Nguyen Hoang Viet	$2a$10$NIs4w39KDjuX3n8ADQhWJ.CbbOVWQoJGs7ESG5cItLNI87g4II0UW	USER	2025-11-28 22:47:57.053533	toibingu
2b6709bd-7a87-449b-9d3c-8c26caebda06	2025-11-28 22:49:31.816343	23020170@gmasdufkjnasd	Nguyen Hoang Vi 	$2a$10$ddnkDg1xdjUok.RbXbSatOiQXjXgHhrsmsFyO7jfpSxjzKRwZOoQW	USER	2025-11-28 22:49:31.816343	toibidan
55622f1a-9a76-4f4f-a2d1-824969e900b6	2025-11-29 01:48:04.220494	vie@xn--ndjkfsdf-8ya	Nguyen Hoang Viet	$2a$10$wxbAl4jMK8qw5pJvrdHxnej9en.E.faYoKOKC2/KKCNhPMG1i0UIC	USER	2025-11-29 01:48:04.220494	vietthdn123
516c6712-2d0f-4c63-93ab-49ac4175a6c7	2025-11-29 01:49:18.67371	hieu@examDSle.com	Nguyen Van Hieu	$2a$10$kpA1qQteirHFazyCgIusCuEiZjINoQ81cemdhAwD7s369uwl9WM3K	MANAGER	2025-11-29 01:49:18.67371	hieudevJDS
6f079306-e075-46c4-bbf7-66e9eac096e5	2025-11-29 01:56:38.539307	admin@gmail.com	viett	$2a$10$cuPj5o2ne/1ka7lKbjgaOOtVJXd2LTyRvGFeCYebX/UD9c1GRCRFu	USER	2025-11-29 01:56:38.540305	manager
07bdf7c8-0855-4c62-9bed-593a4f9bba9a	2025-11-29 02:09:13.749371	vietthdn@shaskfjs	Nguyen Hoang Viet	$2a$10$SSw8amOfHDOWqpr9HNGc4ueSEQXZnIi61EEUqvcN2ITafhF5W6IoK	USER	2025-11-29 02:09:13.749371	vinhquamanhd
3c7fc337-528c-478a-8fb8-53cbbc266725	2025-11-29 02:09:49.960992	vietthdn@shaskfjss	Nguyen Hoang Viet	$2a$10$fP9YeoumshAOe1yjThBotOHws7hXa/wwWGSWVggaUsIoLQmg53fGa	USER	2025-11-29 02:09:49.960992	manager2
5f666bb5-ef5b-4123-9c62-b6edc382105c	2025-11-29 02:17:12.881762	123123123@kjsdfnl	Nguyen Hoang Viet	$2a$10$u1PfoCyobYOoW14YWVUqsespjtj1yU9tzwTzDTgXHx5w0oIsXtxfi	USER	2025-11-29 02:17:12.882332	manager3
1337a449-8126-4bcb-9db6-90f6246f8acc	2025-11-29 02:24:04.560367	123123123@kjsdfnlj	Nguyen Hoang Viet	$2a$10$5aS/k.7CxkDSoSrzmUkUauyVSEgsr74p52vFkv6nHRqQ5iY5W4D4q	MANAGER	2025-11-29 02:24:04.560367	manager4
d134ffc1-4804-4bd0-b0b5-9e4e95b30cae	2025-11-29 02:26:06.60705	Vietthdn2005@gmail.com	Nguyen Hoang Viet	$2a$10$6GNKFoVeypyterHQzq6d9eqGm6cUahy2ysFyMCArzeU/exYvig5W6	MANAGER	2025-11-29 02:26:06.60705	manager5
19f793f0-0fbb-4729-8e06-7bff76a85635	2025-12-01 01:07:17.445822	manager5@sdjfas	Nguyen Hoang Viet	$2a$10$UeoN8zl1ooJBSZWXTWBXmulr0NPD4.4UoVOiYABqR3erAIExUjX.u	ADMIN	2025-12-01 01:07:17.44785	adminviet
7ec01cfa-36fb-4b81-8259-dc3f46cc3ef5	2025-12-01 14:43:26.34264	Vietthdn200d5@gmail.com	Nguyen Hoang Viet	$2a$10$Kt75ylxRe3ko9IeJql6d3OCKpDVYCUN.8JA7gBxvF8AtXfmPqZ./G	USER	2025-12-01 14:43:26.343649	manager22
33f98f08-4d78-4dc8-9f83-6e89253441f5	2025-12-01 14:44:40.015165	Vietthdn200dd5@gmail.com	Nguyen Hoang Viet	$2a$10$lBIhhMIYdUOOJBpYnGG1sOCEMIkl10FD15FchbSUiKnD6oJE5/pRO	USER	2025-12-01 14:44:40.015165	manager22d
6a9c5670-fb31-4ff0-acea-f68a18209648	2025-12-01 14:49:47.919011	Vietthdn200ddd5@gmail.com	Nguyen Hoang Viet	$2a$10$/xkdgCDWArkgkUgx3IXPten7ZROVFy353fnLzgnjWFDMO5TbXeHSK	USER	2025-12-01 14:49:47.919011	manager22dd
5fc47331-6243-4997-b08b-d18af4420aa5	2025-12-01 14:53:18.440183	Vietthdn200ddd5d@gmail.com	Nguyen Hoang Viet	$2a$10$GDXgO2qijvDpAZCmmpW4O.JjL/7WxgjAjdekpxxD1AypLcHOrOZwa	USER	2025-12-01 14:53:18.441183	vo1
b313283b-48cd-4a10-9478-8ab30fead822	2025-12-01 14:53:57.01068	manager2@gnsdalf	Nguyen Hoang Viet	$2a$10$DY78OpVJBPlREqIQMvm6N.99nOGohASE/xfb/XA1R/200cgZa9n8e	USER	2025-12-01 14:53:57.01068	vo2
65717b4a-1ee8-417b-9f9e-4a4e16a8e373	2025-12-01 14:56:29.927993	managedsr2@gnsdalf	Nguyen Hoang Viet	$2a$10$K30iSAldkiAZCUEtBY0oqOqHW9jM/G0lDIQ3IwcfPQGewy/Uc1X1i	USER	2025-12-01 14:56:29.927993	vo3
e535894c-26f7-43f9-81c4-de352490e520	2025-12-01 15:00:42.738908	managedsr2@gnsdalfd	Nguyen Hoang Viet	$2a$10$ECOuyJz5PYP.70cmCRpGi.Pi05FhwqLGe7nnz359YYzHQN4fGpZU2	USER	2025-12-01 15:00:42.738908	vo4
ef87abed-f4ad-4647-8c95-e4f34f34dbba	2025-12-01 15:01:33.012399	dfasdf@gmail.comsd	VBearCode	$2a$10$y2Jwud5kKfIeB8l0b8ASFev6F/flIOGc3jAIXmAd/LOo4ufzxuN5C	USER	2025-12-01 15:01:33.012399	vo5
9ef815af-e6ce-4405-b92e-f44ec2c9750c	2025-12-01 15:04:18.041019	manager2d@gmajdkkf	VBearCode	$2a$10$7W/jwiwSiZ/6keoZPDMxmOtg4aDHRm0FFPf0g2mS.TrjT1YT/JU9e	USER	2025-12-01 15:04:18.041019	vo6
62e2c6de-aa4b-48b0-a593-d633e94dca83	2025-12-01 15:15:10.600782	mdsanager2d@gmajdkkf	VBearCode	$2a$10$ACpONLwfShk8BO/vsUSQ6uvcRLWSTDZq5K7AkzhJiAltWOEg.Tg/G	USER	2025-12-01 15:15:10.601788	vo7
1d668baa-bf45-4889-9033-cb5aebb5e7bb	2025-12-01 17:07:40.125036	blablabla@gmail.com	vietthdn123	$2a$10$kVUrQMoeah85D1gBU.RtAe7ApFtk2Nr3xBNsAlZ4B.48M5D9leUVG	USER	2025-12-01 17:07:40.126037	viethehe
54b21c24-610d-4b67-8962-7e6937ef0a2f	2025-12-02 11:51:35.589177	mdsanager2d@xn--gmdajdkkf-21a	VBearCode	$2a$10$nzi7JK8LLpSzZyQCE9oa1epenr9V12pAao.DHel5nmoExxNEjcrIq	ADMIN	2025-12-02 11:51:35.58975	admin8
e06a1c8f-dee8-45e4-ab0e-db87a093bed2	2025-12-02 23:05:48.415615	mdsanager2d@xn--gmdajdkkfd-u4a	VBearCode	$2a$10$EouKBSrRuw2F4LUUTOmtmu/Ud32FxvkZ6dY8VPKa1YrE9e1m1HQzW	USER	2025-12-02 23:05:48.415615	admin88
301a1dff-416f-4147-b4a1-2e5c3d23dc0e	2025-12-02 23:07:06.375875	viethdaf@gmai.co	Nguyen Hoang Vi	$2a$10$x8Z7KSkwD1ln/GrJ9W4ozuv3qDYVqUnnV5ohjwC5nN11Qo32XfVHG	USER	2025-12-02 23:07:06.375875	admin45
2f60a870-17fc-4521-8658-86e5fc1fe2c6	2025-12-03 00:03:44.56337	vietthdn123@dshufyas	vietthdn123@dshufyas	$2a$10$Vx4Wa.6gXXTzTkyUVpvgNeWbBMmf9NcFqGe9keCuLZGmBLHrU68aK	MANAGER	2025-12-03 00:03:44.56337	managerr
3dc79814-bf80-4c21-a3db-e5c78776d987	2025-12-03 00:28:15.478769	q@asdjfkasd	Nguyen Hoang Viet	$2a$10$JPtL5H6RyszB9cYauakbeOzG/W7ntV0Dds941r8eNp1IZT5ySjWDm	USER	2025-12-03 00:28:15.47932	quangtung
a7b469ac-513f-4b0e-aa3a-601c809e0c58	2025-12-04 00:00:01.088688	q@asdjfkasdqewr	Nguyen Hoang Viet	$2a$10$nJ8SPkDZ2ahATim30.7fcOPsLAW0rxm8KWZYrf8UgA9WmrVs4LmUO	USER	2025-12-04 00:00:01.089685	manager10
a11746db-d6c2-4f0c-9233-110696190972	2025-12-04 22:30:50.325043	admin@gmsdil.com	vietthdn123	$2a$10$iuZuRzTw79fmFvJhO.N7ZuYl/GpGnqcL8s63r85X3EfutjT6dWf1m	USER	2025-12-04 22:30:50.327047	admintest
372b41ae-9f4e-4abe-b909-07c778f1f84f	2025-12-04 22:31:42.117602	vietthdndsadsf2005@gmail.com	vietthdn123	$2a$10$.6c/D2SPimDq9Q41zI7hb.F3MQr04kXx4mTzmzRVBygcvvAOsynOK	ADMIN	2025-12-04 22:31:42.117602	adminvietnam
4937d6df-4387-4358-8035-628e980fd4dd	2025-12-05 00:36:39.685055	quangtung@skjf	Nguyen Hoang Viet	$2a$10$YBYEpl6dbHhuMVTaVOb1ae30RyhR1AKUfJV3sep7l8BwNl0rV9T2O	MANAGER	2025-12-05 00:36:39.685055	manager12
a80588f6-acc0-47eb-8fbe-2f9bca5269c8	2025-12-06 01:16:13.766288	quangtung@skjfdsd	Nguyen Hoang Viet	$2a$10$FyiCO8cT.xoZhs/yqS49DeuFoWrHEgEk.ib6RFAanqwOwrSVBPMDm	MANAGER	2025-12-06 01:16:13.771277	manager2005
9a45c491-d98f-478a-9ba3-34baad39065b	2025-12-08 13:45:57.989886	vietthdn2014@gmail.comd	vietthdn123	$2a$10$IlzkQzkpWS.WRV77CpPFEe2V59iVYtHng8jl4GXkkgDk6qAE58CMu	MANAGER	2025-12-08 13:45:57.991252	mana
3e7d0df7-750a-4364-95e7-8bea038c4069	2025-12-11 01:36:27.400937	manager2005@gmail.com	imagee	$2a$10$Zal2eMPVisnGfygwsg1nlONX1OrpxDNBbmgscjfKF1fJyKvpN96oa	MANAGER	2025-12-11 01:36:27.401931	manager16
10bd217e-2a98-410c-95d0-fe54b48a2ded	2025-12-20 13:44:11.439817	test1@gmail.com	imagee	$2a$10$TP.9uBTxTdu9WB/BBPgBFeyY4Ce7NKfKwH3m7tQgNp7VXuO87PsHu	USER	2025-12-20 13:44:11.439817	test1
1ab04d13-782a-4f25-ba56-28e91cbc6f83	2025-12-21 21:59:25.816935	vietthdn20145255@gmail.com	Đoàn Thanh Niên Tỉnh Thái Bình	$2a$10$p807n7EaE4vyn70qYs1hYOLoQ0vJl8iNVk/lypcF8L1CjchsEYiX.	MANAGER	2025-12-21 21:59:25.822126	doanthanhnien
e6ad9f22-fce4-48c5-96ac-50fa9def24c8	2025-12-21 22:05:41.042037	vietthdn201dd4@gmail.com	Chữ Thập Đỏ	$2a$10$VsFFQX73AbAatbF1S/hHpeuh9SUXP9IE/WWO1QTVmxnGbiC8/yp7C	MANAGER	2025-12-21 22:05:41.04455	manager68
ed3dabab-9208-43e1-a66e-66fce484086c	2025-12-21 22:21:41.54895	vietthdn201d5d4@gmail.com	Luu Quang Tung	$2a$10$.eFwPDs97BOEMs1M/Typterpn1RlSV5bc60.oEUBD7hvTmX3YtKQm	USER	2025-12-21 22:21:41.54895	volunteer52
686a4570-6a46-414d-a50f-5b5f19fce003	2025-12-21 23:33:43.804281	manager68@gmail.com	Luu Quang Tung	$2a$10$1Z8.zaaEdpnK9UNP7I0apeJjbTX//t7qCfJoG.TlN0ypaL.LvwRoW	USER	2025-12-21 23:33:43.808366	volunteer20005
79c944f2-ac6b-49fb-beb4-fc2d15d672f9	2025-12-21 23:36:17.732379	volunteer20005@gmail.com	Luu Quang Tung	$2a$10$CrX9PoE7N1ZNXOXXS0EQZ.K4pSkr71SdAVCok73fuxtN0qkJX31MO	USER	2025-12-21 23:36:17.732379	volunteer2006
\.


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: users ukr43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT ukr43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 4Bpbne7K7XEcfptKKRfiu7NjqRAjoKbMqa5EE9dRyTpAQHYEmG1sSqkHW0Nsrr4

